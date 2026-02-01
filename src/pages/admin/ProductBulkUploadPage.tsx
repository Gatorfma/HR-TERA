import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, X, RefreshCw, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProductCategory, AdminVendorLookup } from "@/lib/admin-types";
import { adminLookupVendor, adminBulkCreateProducts } from "@/api/adminProductsApi";
import { getAllCategories } from "@/api/supabaseApi";

interface ParsedProduct {
  id: string;
  rawCategory: string;
  productName: string;
  website: string;
  status: "valid" | "invalid" | "approved";
  error?: string;
  resolvedCategory?: ProductCategory;
}

interface CategoryMapping {
  from: string;
  to: ProductCategory;
  isNew: boolean;
}

const ProductBulkUploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Vendor state
  const [vendorId, setVendorId] = useState("");
  const [vendorStatus, setVendorStatus] = useState<"none" | "loading" | "valid" | "invalid">("none");
  const [resolvedVendor, setResolvedVendor] = useState<AdminVendorLookup | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>([]);
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

  // Handle Vendor ID blur - lookup vendor
  const handleVendorIdBlur = async () => {
    if (!vendorId.trim()) {
      setVendorStatus("none");
      setResolvedVendor(null);
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(vendorId.trim())) {
      setVendorStatus("invalid");
      setResolvedVendor(null);
      return;
    }

    setVendorStatus("loading");
    try {
      const vendor = await adminLookupVendor(vendorId.trim());
      if (vendor) {
        setVendorStatus("valid");
        setResolvedVendor(vendor);
      } else {
        setVendorStatus("invalid");
        setResolvedVendor(null);
      }
    } catch (err) {
      setVendorStatus("invalid");
      setResolvedVendor(null);
    }
  };

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

  const validateWebsite = (url: string): boolean => {
    if (!url || url.trim() === "") return true; // Website is optional
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
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
      const headerKeywords = ["category", "kategori", "product", "ürün", "website", "site"];
      const isHeader = firstRow.some((cell) =>
        headerKeywords.some((keyword) =>
          String(cell || "").toLowerCase().includes(keyword)
        )
      );

      const dataRows = isHeader ? jsonData.slice(1) : jsonData;
      const products: ParsedProduct[] = [];

      dataRows.forEach((row, index) => {
        const cells = row as string[];
        if (cells.length < 2) return;

        const rawCategory = String(cells[0] || "").trim();
        const productName = String(cells[1] || "").trim();
        const website = String(cells[2] || "").trim();

        if (!productName) return;

        const errors: string[] = [];
        const matchedCategory = matchCategory(rawCategory);
        const websiteValid = validateWebsite(website);

        if (!matchedCategory && rawCategory) {
          errors.push("Geçersiz kategori");
        }
        if (!websiteValid) {
          errors.push("Geçersiz website formatı");
        }

        const isValid = matchedCategory !== null && websiteValid;

        products.push({
          id: `product-${index}-${Date.now()}`,
          rawCategory,
          productName,
          website: website.startsWith("http") ? website : (website ? `https://${website}` : ""),
          status: isValid ? "valid" : "invalid",
          error: errors.length > 0 ? errors.join(", ") : undefined,
          resolvedCategory: matchedCategory || undefined,
        });
      });

      const validCount = products.filter((p) => p.status === "valid").length;
      const invalidCount = products.filter((p) => p.status === "invalid").length;

      setParsedProducts(products);
      setCategoryMappings([]);
      setImportResults(null);

      toast({
        title: "Dosya işlendi",
        description: `${products.length} ürün bulundu: ${validCount} geçerli, ${invalidCount} geçersiz.`,
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

  const handleMapCategory = (rawCategory: string, targetCategory: ProductCategory) => {
    setParsedProducts((prev) =>
      prev.map((p) =>
        p.rawCategory.toLowerCase() === rawCategory.toLowerCase() && p.status === "invalid"
          ? { ...p, status: "approved" as const, resolvedCategory: targetCategory, error: undefined }
          : p
      )
    );

    setCategoryMappings((prev) => [
      ...prev,
      { from: rawCategory, to: targetCategory, isNew: false },
    ]);

    const affectedCount = parsedProducts.filter(
      (p) => p.rawCategory.toLowerCase() === rawCategory.toLowerCase() && p.status === "invalid"
    ).length;

    toast({
      title: "Kategori eşlendi",
      description: `'${rawCategory}' → '${targetCategory}' olarak eşlendi (${affectedCount} ürün).`,
    });
  };

  const handleRejectProduct = (productId: string) => {
    setParsedProducts((prev) => prev.filter((p) => p.id !== productId));
    toast({
      title: "Ürün çıkarıldı",
      description: "Ürün listeden çıkarıldı.",
    });
  };

  const handleRejectAllInvalid = () => {
    const invalidCount = parsedProducts.filter((p) => p.status === "invalid").length;
    setParsedProducts((prev) => prev.filter((p) => p.status !== "invalid"));
    toast({
      title: "Geçersiz ürünler çıkarıldı",
      description: `${invalidCount} geçersiz ürün listeden çıkarıldı.`,
    });
  };

  const handleImport = async () => {
    if (vendorStatus !== "valid" || !resolvedVendor) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir Vendor ID girin.",
        variant: "destructive",
      });
      return;
    }

    const validProducts = parsedProducts.filter(
      (p) => p.status === "valid" || p.status === "approved"
    );

    if (validProducts.length === 0) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const productsToImport = validProducts.map((p) => ({
        product_name: p.productName,
        main_category: p.resolvedCategory!,
        website_link: p.website || "",
        short_desc: p.productName,
      }));

      const result = await adminBulkCreateProducts(vendorId.trim(), productsToImport);

      setImportResults({
        success: result.success_count,
        failed: result.error_count,
        errors: result.errors.map((e: any) => ({ name: e.product_name, message: e.error })),
      });

      toast({
        title: "İçe aktarma tamamlandı",
        description: `${result.success_count} başarılı, ${result.error_count} başarısız.`,
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.message || "İçe aktarma başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setParsedProducts([]);
    setCategoryMappings([]);
    setImportResults(null);
  };

  const validCount = parsedProducts.filter((p) => p.status === "valid" || p.status === "approved").length;
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
                      Excel ile Toplu Ürün Ekle
                    </h1>
                    <p className="text-muted-foreground">
                      Excel dosyanız aşağıdaki sırayla sütunlar içermelidir: Category, Product Name, Website.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Vendor Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vendor Seçimi</CardTitle>
                      <CardDescription>Ürünlerin ekleneceği vendor'ı belirtin</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="vendorId">Vendor ID *</Label>
                        <Input
                          id="vendorId"
                          value={vendorId}
                          onChange={(e) => setVendorId(e.target.value)}
                          onBlur={handleVendorIdBlur}
                          placeholder="Vendor UUID"
                        />
                        {vendorStatus === "loading" && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Vendor aranıyor...</span>
                          </div>
                        )}
                        {vendorStatus === "valid" && resolvedVendor && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>
                              Vendor: {resolvedVendor.company_name || "İsimsiz"} 
                              <Badge className="ml-2 capitalize">{resolvedVendor.subscription}</Badge>
                            </span>
                          </div>
                        )}
                        {vendorStatus === "invalid" && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>Geçersiz Vendor ID</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Drop Zone */}
                  <Card className={vendorStatus !== "valid" ? "opacity-50 pointer-events-none" : ""}>
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
                          disabled={vendorStatus !== "valid"}
                        />
                      </label>
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        İlk sayfa kullanılacaktır. Sütun sırası: Category, Product Name, Website (opsiyonel).
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Valid Categories Panel */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Geçerli Kategoriler</CardTitle>
                    <CardDescription>Veritabanındaki mevcut kategoriler ({availableCategories.length})</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto">
                      {availableCategories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
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
                  <h1 className="text-2xl font-bold text-foreground">Ürün Listesi</h1>
                  <p className="text-muted-foreground">
                    {parsedProducts.length} ürün • {validCount} geçerli • {invalidCount} geçersiz
                  </p>
                  {resolvedVendor && (
                    <p className="text-sm text-primary mt-1">
                      Vendor: {resolvedVendor.company_name || "İsimsiz"} ({resolvedVendor.subscription})
                    </p>
                  )}
                </div>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Baştan Başla
                </Button>
              </div>

              {/* Category Mappings Notice */}
              {categoryMappings.length > 0 && (
                <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-amber-600">
                      Kategori eşleştirmeleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categoryMappings.map((mapping, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-amber-500/50 text-amber-600"
                        >
                          {mapping.from} → {mapping.to}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product List */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {parsedProducts.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          categories={availableCategories}
                          onMap={handleMapCategory}
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
                    {invalidCount} geçersiz ürün beklemede.
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
                disabled={validCount === 0 || isImporting || vendorStatus !== "valid"}
                onClick={handleImport}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    İçe Aktarılıyor…
                  </>
                ) : (
                  <>
                    {validCount} Ürünü İçe Aktar
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
  categories: readonly ProductCategory[];
  onMap: (rawCategory: string, targetCategory: ProductCategory) => void;
  onReject: (productId: string) => void;
}

const ProductRow = ({ product, categories, onMap, onReject }: ProductRowProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBorderColor = () => {
    switch (product.status) {
      case "valid":
        return "border-green-500/30 bg-green-500/5";
      case "approved":
        return "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]";
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
      case "approved":
        return <CheckCircle className="h-5 w-5 text-amber-500" />;
      case "invalid":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getCategoryBadge = () => {
    if (product.resolvedCategory) {
      return (
        <Badge
          variant="secondary"
          className={
            product.status === "approved"
              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
              : "bg-primary/10 text-primary border-primary/20 text-xs"
          }
        >
          {product.resolvedCategory}
        </Badge>
      );
    }
    if (product.rawCategory) {
      return (
        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
          {product.rawCategory}
        </Badge>
      );
    }
    return null;
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
        <div className="flex items-center gap-2 mt-1">
          {getCategoryBadge()}
        </div>
        {product.website && (
          <p className="text-sm text-muted-foreground truncate mt-1">{product.website}</p>
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
        {product.status === "approved" && (
          <span className="text-sm font-medium text-amber-600">Eşlendi</span>
        )}
      </div>

      {/* Actions for Invalid */}
      {product.status === "invalid" && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
              >
                Eşle...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="end">
              <Input
                placeholder="Kategori ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => onMap(product.rawCategory, category)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 px-2"
            onClick={() => onReject(product.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ProductBulkUploadPage;
