import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  ArrowRight,
  Loader2,
  ArrowLeft,
  ImageIcon,
  Copy,
} from "lucide-react";
import * as XLSX from "xlsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BulkLogoInput } from "@/lib/admin-types";
import { adminCheckLogoStatus, adminBulkUpdateLogos } from "@/api/adminUserApi";

// "existing" = vendor/product already has a logo in DB (geçersiz per user spec)
type RowStatus = "valid" | "invalid" | "existing";

interface ParsedLogoRow {
  id: string;
  companyName: string;
  websiteLink: string;
  vendorLogo: string;
  productLogo: string;
  status: RowStatus;
  error?: string;
}

const LogoBulkUploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedLogoRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isCheckingLogos, setIsCheckingLogos] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: { name: string; message: string }[];
  } | null>(null);

  const validateUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return true;
    return /^https?:\/\/.+/.test(url);
  };

  const parseExcelFile = useCallback(
    async (file: File) => {
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

        const firstRow = jsonData[0] as string[];
        const headerKeywords = [
          "company",
          "şirket",
          "website",
          "site",
          "vendor",
          "logo",
          "product",
          "ürün",
        ];
        const isHeader = firstRow.some((cell) =>
          headerKeywords.some((kw) => String(cell || "").toLowerCase().includes(kw))
        );

        const dataRows = isHeader ? jsonData.slice(1) : jsonData;
        const rows: ParsedLogoRow[] = [];

        dataRows.forEach((row, index) => {
          const cells = row as string[];
          if (cells.length < 1) return;

          const companyName = String(cells[0] || "").trim();
          const websiteLink = String(cells[1] || "").trim();
          const vendorLogo = String(cells[2] || "").trim();
          const productLogo = String(cells[3] || "").trim();

          if (!companyName && !websiteLink) return;

          const errors: string[] = [];

          if (!companyName) {
            errors.push("Şirket adı zorunludur");
          }

          if (vendorLogo && !validateUrl(vendorLogo)) {
            errors.push("Geçersiz vendor logo URL (http:// veya https:// ile başlamalı)");
          }

          if (productLogo && !validateUrl(productLogo)) {
            errors.push("Geçersiz product logo URL (http:// veya https:// ile başlamalı)");
          }

          if (!vendorLogo && !productLogo) {
            errors.push("En az bir logo URL girilmelidir");
          }

          rows.push({
            id: `logo-${index}-${Date.now()}`,
            companyName,
            websiteLink,
            vendorLogo,
            productLogo,
            status: errors.length > 0 ? "invalid" : "valid",
            error: errors.length > 0 ? errors.join(", ") : undefined,
          });
        });

        // Check DB for existing logos on format-valid rows
        const validRows = rows.filter((r) => r.status === "valid");
        if (validRows.length > 0) {
          setIsCheckingLogos(true);
          try {
            const entries = validRows.map((r) => ({
              company_name: r.companyName,
              website_link: r.websiteLink || undefined,
            }));

            const results = await adminCheckLogoStatus(entries);

            // Build lookup by company_name (lower-cased)
            const resultMap = new Map<string, typeof results[0]>();
            results.forEach((res) => {
              if (res.company_name) {
                resultMap.set(res.company_name.toLowerCase(), res);
              }
            });

            for (const row of rows) {
              if (row.status !== "valid") continue;
              const res = resultMap.get(row.companyName.toLowerCase());
              if (!res) continue;

              if (!res.vendor_found) {
                row.status = "invalid";
                row.error = "Şirket sistemde bulunamadı";
                continue;
              }

              // "existing" if the columns we're trying to fill already have values
              const vendorConflict = row.vendorLogo && res.vendor_has_logo;
              const productConflict = row.productLogo && res.products_with_logo > 0;

              if (vendorConflict || productConflict) {
                row.status = "existing";
                const parts: string[] = [];
                if (vendorConflict) parts.push("vendor'ın zaten bir logosu var");
                if (productConflict)
                  parts.push(
                    `${res.products_with_logo} ürünün zaten logosu var`
                  );
                row.error = parts.join("; ");
              }
            }
          } catch (err) {
            console.error("Error checking logo status:", err);
          } finally {
            setIsCheckingLogos(false);
          }
        }

        const validCount = rows.filter((r) => r.status === "valid").length;
        const invalidCount = rows.filter((r) => r.status === "invalid").length;
        const existingCount = rows.filter((r) => r.status === "existing").length;

        setParsedRows(rows);
        setImportResults(null);

        toast({
          title: "Dosya işlendi",
          description: `${rows.length} satır bulundu: ${validCount} geçerli, ${invalidCount} geçersiz${
            existingCount > 0 ? `, ${existingCount} mevcut logo` : ""
          }.`,
        });
      } catch {
        toast({
          title: "Hata",
          description: "Excel dosyası okunamadı.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

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
      if (file) parseExcelFile(file);
    },
    [parseExcelFile]
  );

  const handleRejectRow = (rowId: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== rowId));
    toast({ title: "Satır çıkarıldı", description: "Satır listeden çıkarıldı." });
  };

  const handleRejectAllInvalid = () => {
    const count = parsedRows.filter(
      (r) => r.status === "invalid" || r.status === "existing"
    ).length;
    setParsedRows((prev) => prev.filter((r) => r.status === "valid"));
    toast({
      title: "Geçersiz satırlar çıkarıldı",
      description: `${count} geçersiz satır listeden çıkarıldı.`,
    });
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.status === "valid");
    if (validRows.length === 0) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const logosToImport: BulkLogoInput[] = validRows.map((r) => ({
        company_name: r.companyName,
        website_link: r.websiteLink || undefined,
        vendor_logo: r.vendorLogo || undefined,
        product_logo: r.productLogo || undefined,
      }));

      const result = await adminBulkUpdateLogos(logosToImport);

      setImportResults({
        success: result.success_count,
        failed: result.error_count,
        errors: result.errors.map((e) => ({ name: e.company_name, message: e.error })),
      });

      toast({
        title: "Güncelleme tamamlandı",
        description: `${result.success_count} başarılı, ${result.error_count} başarısız.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Güncelleme başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setParsedRows([]);
    setImportResults(null);
  };

  const validCount = parsedRows.filter((r) => r.status === "valid").length;
  const invalidCount = parsedRows.filter((r) => r.status === "invalid").length;
  const existingCount = parsedRows.filter((r) => r.status === "existing").length;
  const rejectedCount = invalidCount + existingCount;
  const showList = parsedRows.length > 0;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin?tab=users")}
          className="-ml-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <AnimatePresence mode="wait">
          {!showList ? (
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
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Excel ile Toplu Logo Güncelle
                    </h1>
                    <p className="text-muted-foreground">
                      Excel dosyanız aşağıdaki sırayla sütunlar içermelidir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Drop Zone */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="p-8">
                      <label
                        htmlFor="file-upload"
                        className={`
                          relative flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed cursor-pointer
                          transition-all duration-200
                          ${
                            isDragging
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
                        İlk sayfa kullanılacaktır.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Info Panel */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Sütun Bilgileri</CardTitle>
                    <CardDescription>Excel dosyanız için gerekli sütunlar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">1</Badge>
                        <span className="font-medium">company_name</span>
                        <span className="text-destructive">*</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">2</Badge>
                        <span>website_link</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">3</Badge>
                        <span>vendor_logo</span>
                        <span className="text-muted-foreground text-xs">(vendor logosu URL)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">4</Badge>
                        <span>product_logo</span>
                        <span className="text-muted-foreground text-xs">(ürün logosu URL)</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      <p className="text-xs text-muted-foreground">
                        <strong>Notlar:</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • vendor_logo → vendors tablosundaki logo alanı güncellenir.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • product_logo → o vendor'a ait tüm ürünlerin logo alanı güncellenir.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • Zaten logosu bulunan satırlar <strong>Geçersiz</strong> olarak işaretlenir.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Logo Listesi</h1>
                  <p className="text-muted-foreground">
                    {parsedRows.length} satır • {validCount} geçerli • {invalidCount} geçersiz
                    {existingCount > 0 && ` • ${existingCount} mevcut logo`}
                  </p>
                </div>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Baştan Başla
                </Button>
              </div>

              {/* Checking logos indicator */}
              {isCheckingLogos && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-primary font-medium">
                    Mevcut logolar kontrol ediliyor…
                  </span>
                </div>
              )}

              {/* Row List */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {parsedRows.map((row) => (
                        <LogoRow key={row.id} row={row} onReject={handleRejectRow} />
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Reject All Invalid */}
              {rejectedCount > 0 && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20 mb-6">
                  <span className="text-destructive font-medium">
                    {rejectedCount} geçersiz satır beklemede.
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRejectAllInvalid}
                  >
                    Tümünü Reddet ({rejectedCount})
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
                    Güncelleniyor…
                  </>
                ) : (
                  <>
                    {validCount} Satırı Güncelle
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
                              <span>
                                {error.name}: {error.message}
                              </span>
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

// ============================================================
// LogoRow sub-component
// ============================================================

interface LogoRowProps {
  row: ParsedLogoRow;
  onReject: (rowId: string) => void;
}

const LogoRow = ({ row, onReject }: LogoRowProps) => {
  const getBorderColor = () => {
    switch (row.status) {
      case "valid":
        return "border-green-500/30 bg-green-500/5";
      case "existing":
        return "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]";
      case "invalid":
        return "border-destructive/30 bg-destructive/5 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]";
    }
  };

  const getIcon = () => {
    switch (row.status) {
      case "valid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "existing":
        return <Copy className="h-5 w-5 text-amber-500" />;
      case "invalid":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusLabel = () => {
    switch (row.status) {
      case "valid":
        return <span className="text-sm font-medium text-green-600">Geçerli</span>;
      case "existing":
        return <span className="text-sm font-medium text-amber-600">Geçersiz</span>;
      case "invalid":
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
        <p className="font-medium text-foreground truncate">{row.companyName}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
          {row.websiteLink && <span className="truncate max-w-[160px]">{row.websiteLink}</span>}
          {row.vendorLogo && (
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[140px]">V: {row.vendorLogo}</span>
            </span>
          )}
          {row.productLogo && (
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[140px]">P: {row.productLogo}</span>
            </span>
          )}
        </div>
        {row.error && (
          <p className="text-xs text-destructive mt-1">{row.error}</p>
        )}
      </div>

      {/* Status Label */}
      <div className="flex-shrink-0">{getStatusLabel()}</div>

      {/* Remove button */}
      <Button
        variant="outline"
        size="sm"
        className="border-destructive/50 text-destructive hover:bg-destructive/10 px-2 flex-shrink-0"
        onClick={() => onReject(row.id)}
        title="Çıkar"
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default LogoBulkUploadPage;
