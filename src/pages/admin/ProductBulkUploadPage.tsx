import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, X, RefreshCw, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BulkProductInput, ProductCategory } from "@/lib/admin-types";
import { adminBulkCreateProducts } from "@/api/adminProductsApi";
import { getAllCategories } from "@/api/supabaseApi";

interface ParsedProduct {
  id: string;
  productName: string;
  companyName: string;
  shortDesc: string;
  longDesc: string;
  mainCategory: string;
  websiteLink: string;
  features: string;
  languages: string;
  status: "valid" | "invalid";
  error?: string;
  resolvedCategory?: ProductCategory;
}

const ProductBulkUploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: { name: string; message: string }[];
  } | null>(null);
  const [availableCategories, setAvailableCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch categories from database
    const fetchCategories = async () => {
      try {
        const categories = await getAllCategories();
        setAvailableCategories(categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Match category from Excel to DB category
  const matchCategory = useCallback((rawCategory: string): ProductCategory | null => {
    const normalized = rawCategory.toLowerCase().trim();

    // Exact match (case-insensitive)
    const exactMatch = availableCategories.find(
      (cat) => cat.toLowerCase() === normalized
    );
    if (exactMatch) return exactMatch;

    // Partial match
    const partialMatch = availableCategories.find(
      (cat) =>
        cat.toLowerCase().includes(normalized) ||
        normalized.includes(cat.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    return null;
  }, [availableCategories]);

  // Validation helpers
  const validateWebsite = (url: string): boolean => {
    if (!url || url.trim() === "") return true; // Website is optional
    return /^https?:\/\/.+/.test(url);
  };

  const parseExcelFile = useCallback(async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as unknown[][];

      if (jsonData.length === 0) {
        toast({
          title: "Hata",
          description: "Excel dosyası boş görünüyor.",
          variant: "destructive",
        });
        return;
      }

      // Check if first row is a header
      const firstRow = jsonData[0] as string[];
      const headerKeywords = ["product", "çözüm", "company", "şirket", "category", "kategori", "website", "features", "languages"];
      const isHeader = firstRow.some((cell) =>
        headerKeywords.some((keyword) =>
          String(cell || "").toLowerCase().includes(keyword)
        )
      );

      const dataRows = isHeader ? jsonData.slice(1) : jsonData;
      const products: ParsedProduct[] = [];

      // Column order: product_name, company_name, short_desc, long_desc, main_category, website_link, features, languages
      dataRows.forEach((row, index) => {
        const cells = row as string[];
        if (cells.length < 1) return;

        const productName = String(cells[0] || "").trim();
        const companyName = String(cells[1] || "").trim();
        const shortDesc = String(cells[2] || "").trim();
        const longDesc = String(cells[3] || "").trim();
        const mainCategory = String(cells[4] || "").trim();
        const websiteLink = String(cells[5] || "").trim();
        const features = String(cells[6] || "").trim();
        const languages = String(cells[7] || "").trim();

        if (!productName) return; // Skip empty rows

        const errors: string[] = [];

        // Validate required fields
        if (!productName) {
          errors.push("Çözüm adı zorunludur");
        }
        if (!companyName) {
          errors.push("Şirket adı zorunludur");
        }
        if (!mainCategory) {
          errors.push("Kategori zorunludur");
        }

        // Validate category
        const matchedCategory = matchCategory(mainCategory);
        if (mainCategory && !matchedCategory) {
          errors.push("Geçersiz kategori");
        }

        // Validate website format
        if (websiteLink && !validateWebsite(websiteLink)) {
          errors.push("Geçersiz website formatı");
        }

        const isValid = errors.length === 0 && matchedCategory !== null;

        products.push({
          id: `product-${index}-${Date.now()}`,
          productName,
          companyName,
          shortDesc: shortDesc || productName, // Default to product name
          longDesc,
          mainCategory,
          websiteLink: websiteLink.startsWith("http") ? websiteLink : (websiteLink ? `https://${websiteLink}` : ""),
          features,
          languages,
          status: isValid ? "valid" : "invalid",
          error: errors.length > 0 ? errors.join(", ") : undefined,
          resolvedCategory: matchedCategory || undefined,
        });
      });

      const validCount = products.filter((p) => p.status === "valid").length;
      const invalidCount = products.filter((p) => p.status === "invalid").length;

      setParsedProducts(products);
      setImportResults(null);

      toast({
        title: "Dosya işlendi",
        description: `${products.length} çözüm bulundu: ${validCount} geçerli, ${invalidCount} geçersiz.`,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Excel dosyası okunamadı.",
        variant: "destructive",
      });
    }
  }, [matchCategory, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        parseExcelFile(file);
      } else {
        toast({
          title: "Geçersiz dosya",
          description: "Lütfen bir Excel dosyası (.xlsx veya .xls) yükleyin.",
          variant: "destructive",
        });
      }
    },
    [parseExcelFile, toast]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        parseExcelFile(file);
      }
    },
    [parseExcelFile]
  );

  const handleRejectProduct = (productId: string) => {
    setParsedProducts((prev) => prev.filter((p) => p.id !== productId));
    toast({
      title: "Çözüm çıkarıldı",
      description: "Çözüm listeden çıkarıldı.",
    });
  };

  const handleRejectAllInvalid = () => {
    const invalidCount = parsedProducts.filter((p) => p.status === "invalid").length;
    setParsedProducts((prev) => prev.filter((p) => p.status !== "invalid"));
    toast({
      title: "Geçersiz çözümler çıkarıldı",
      description: `${invalidCount} geçersiz çözüm listeden çıkarıldı.`,
    });
  };

  // Parse comma/semicolon separated string into array
  const parseArrayField = (value: string): string[] => {
    if (!value || value.trim() === "") return [];
    return value.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
  };

  // Map language names to Turkish equivalents (system uses Turkish names)
  const LANGUAGE_MAP: Record<string, string> = {
    // English -> Turkish
    "turkish": "Türkçe",
    "english": "İngilizce",
    "german": "Almanca",
    "french": "Fransızca",
    "spanish": "İspanyolca",
    "italian": "İtalyanca",
    "portuguese": "Portekizce",
    "dutch": "Felemenkçe",
    "polish": "Lehçe",
    "russian": "Rusça",
    "japanese": "Japonca",
    "chinese": "Çince",
    "korean": "Korece",
    "arabic": "Arapça",
    // Turkish names (pass through)
    "türkçe": "Türkçe",
    "ingilizce": "İngilizce",
    "almanca": "Almanca",
    "fransızca": "Fransızca",
    "ispanyolca": "İspanyolca",
    "italyanca": "İtalyanca",
    "portekizce": "Portekizce",
    "felemenkçe": "Felemenkçe",
    "lehçe": "Lehçe",
    "rusça": "Rusça",
    "japonca": "Japonca",
    "çince": "Çince",
    "korece": "Korece",
    "arapça": "Arapça",
  };

  const mapLanguage = (lang: string): string => {
    const normalized = lang.toLowerCase().trim();
    return LANGUAGE_MAP[normalized] || lang; // Return mapped or original
  };

  const parseLanguages = (value: string): string[] => {
    const langs = parseArrayField(value);
    return langs.map(mapLanguage);
  };

  const handleImport = async () => {
    const validProducts = parsedProducts.filter((p) => p.status === "valid");

    if (validProducts.length === 0) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const productsToImport: BulkProductInput[] = validProducts.map((p) => ({
        product_name: p.productName,
        company_name: p.companyName,
        short_desc: p.shortDesc || p.productName,
        long_desc: p.longDesc || undefined,
        main_category: p.resolvedCategory!,
        website_link: p.websiteLink || undefined,
        features: parseArrayField(p.features),
        languages: parseLanguages(p.languages),
      }));

      const result = await adminBulkCreateProducts(productsToImport);

      setImportResults({
        success: result.success_count,
        failed: result.error_count,
        errors: result.errors.map((e) => ({ name: e.product_name, message: e.error })),
      });

      toast({
        title: "İçe aktarma tamamlandı",
        description: `${result.success_count} başarılı, ${result.error_count} başarısız.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "İçe aktarma başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setParsedProducts([]);
    setImportResults(null);
  };

  const validCount = parsedProducts.filter((p) => p.status === "valid").length;
  const invalidCount = parsedProducts.filter((p) => p.status === "invalid").length;
  const showProductList = parsedProducts.length > 0;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/products")}
          className="-ml-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <AnimatePresence mode="wait">
          {!showProductList ? (
            <motion.div
              key="upload-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Excel ile Toplu Çözüm Ekle
                    </h1>
                    <p className="text-muted-foreground">
                      Excel dosyanız aşağıdaki sırayla sütunlar içermelidir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Drop Zone */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="p-8">
                      <label
                        htmlFor="file-upload"
                        className={`
                          relative flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed cursor-pointer
                          transition-all duration-200
                          ${isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }
                        `}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                      >
                        <div className="p-4 rounded-full bg-primary/10 mb-4">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-lg font-medium text-foreground mb-1">
                          Excel dosyasını buraya sürükleyin
                        </p>
                        <p className="text-muted-foreground">
                          veya dosya seçmek için tıklayın
                        </p>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        İlk sayfa kullanılacaktır. Features ve Languages virgül veya noktalı virgül ile ayrılmalıdır.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Info Panel */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Sütun Bilgileri</CardTitle>
                    <CardDescription>Excel dosyanız için gerekli sütunlar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">1</Badge>
                        <span className="font-medium">Product Name</span>
                        <span className="text-destructive">*</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">2</Badge>
                        <span className="font-medium">Company Name</span>
                        <span className="text-destructive">*</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">3</Badge>
                        <span>Short Description</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">4</Badge>
                        <span>Long Description</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">5</Badge>
                        <span className="font-medium">Main Category</span>
                        <span className="text-destructive">*</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">6</Badge>
                        <span>Website Link</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">7</Badge>
                        <span>Features</span>
                        <span className="text-muted-foreground text-xs">(virgülle ayır)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">8</Badge>
                        <span>Languages</span>
                        <span className="text-muted-foreground text-xs">(virgülle ayır)</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong>Otomatik değerler:</strong><br />
                        • listing_status: approved<br />
                        • logo: placeholder image
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="product-list-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Çözüm Listesi</h1>
                  <p className="text-muted-foreground">
                    {parsedProducts.length} çözüm • {validCount} geçerli • {invalidCount} geçersiz
                  </p>
                </div>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Baştan Başla
                </Button>
              </div>

              {/* Product List */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {parsedProducts.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          onReject={handleRejectProduct}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Reject All Invalid */}
              {invalidCount > 0 && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20 mb-6">
                  <span className="text-destructive font-medium">
                    {invalidCount} geçersiz çözüm beklemede.
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRejectAllInvalid}
                  >
                    Tümünü Reddet ({invalidCount})
                  </Button>
                </div>
              )}

              {/* Import Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={validCount === 0 || isImporting}
                onClick={handleImport}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    İçe Aktarılıyor…
                  </>
                ) : (
                  <>
                    {validCount} Çözümü İçe Aktar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Import Results */}
              {importResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="flex gap-4">
                    {importResults.success > 0 && (
                      <div className="flex-1 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">{importResults.success} başarılı</span>
                        </div>
                      </div>
                    )}
                    {importResults.failed > 0 && (
                      <div className="flex-1 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                        <div className="flex items-center gap-2 text-destructive">
                          <X className="h-5 w-5" />
                          <span className="font-semibold">{importResults.failed} başarısız</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {importResults.errors.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {importResults.errors.map((error, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-amber-600"
                            >
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              <span>{error.name}: {error.message}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button variant="outline" onClick={handleReset} className="w-full">
                    Baştan Başla
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

interface ProductRowProps {
  product: ParsedProduct;
  onReject: (productId: string) => void;
}

const ProductRow = ({ product, onReject }: ProductRowProps) => {
  const getBorderColor = () => {
    switch (product.status) {
      case "valid":
        return "border-green-500/30 bg-green-500/5";
      case "invalid":
        return "border-destructive/30 bg-destructive/5 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (product.status) {
      case "valid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "invalid":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${getBorderColor()}`}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{product.productName}</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span className="truncate">{product.companyName}</span>
          {product.resolvedCategory && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {product.resolvedCategory}
            </Badge>
          )}
          {!product.resolvedCategory && product.mainCategory && (
            <Badge variant="destructive" className="text-xs">
              {product.mainCategory}
            </Badge>
          )}
        </div>
        {product.websiteLink && (
          <p className="text-sm text-muted-foreground truncate mt-1">{product.websiteLink}</p>
        )}
        {product.error && (
          <p className="text-sm text-destructive mt-1">{product.error}</p>
        )}
      </div>

      {/* Status Label */}
      <div className="flex-shrink-0">
        {product.status === "valid" && (
          <span className="text-sm font-medium text-green-600">Geçerli</span>
        )}
      </div>

      {/* Actions for Invalid */}
      {product.status === "invalid" && (
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/50 text-destructive hover:bg-destructive/10 px-2"
          onClick={() => onReject(product.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
};

export default ProductBulkUploadPage;
