import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, X, RefreshCw, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BulkVendorInput } from "@/lib/admin-types";
import { adminBulkCreateVendors } from "@/api/adminUserApi";

interface ParsedVendor {
    id: string;
    companyName: string;
    websiteLink: string;
    headquarters: string;
    foundedAt: string;
    companySize: string;
    companyMotto: string;
    companyDesc: string;
    status: "valid" | "invalid";
    error?: string;
}

const CompanyBulkUploadPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isDragging, setIsDragging] = useState(false);
    const [parsedVendors, setParsedVendors] = useState<ParsedVendor[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importResults, setImportResults] = useState<{
        success: number;
        failed: number;
        errors: { name: string; message: string }[];
    } | null>(null);

    // Validation helpers
    const validateWebsite = (url: string): boolean => {
        if (!url || url.trim() === "") return true; // Website is optional
        return /^https?:\/\/.+/.test(url);
    };

    const validateCompanySize = (size: string): boolean => {
        if (!size || size.trim() === "") return true; // Size is optional
        return /^[0-9]+-[0-9]+$/.test(size.trim());
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
            const headerKeywords = ["company", "şirket", "website", "site", "headquarters", "merkez", "founded", "kuruluş", "size", "büyüklük"];
            const isHeader = firstRow.some((cell) =>
                headerKeywords.some((keyword) =>
                    String(cell || "").toLowerCase().includes(keyword)
                )
            );

            const dataRows = isHeader ? jsonData.slice(1) : jsonData;
            const vendors: ParsedVendor[] = [];

            // Column order: company_name, website_link, headquarters, founded_at, company_size, company_motto, company_desc
            dataRows.forEach((row, index) => {
                const cells = row as string[];
                if (cells.length < 1) return;

                const companyName = String(cells[0] || "").trim();
                const websiteLink = String(cells[1] || "").trim();
                const headquarters = String(cells[2] || "").trim();
                const foundedAt = String(cells[3] || "").trim();
                const companySize = String(cells[4] || "").trim();
                const companyMotto = String(cells[5] || "").trim();
                const companyDesc = String(cells[6] || "").trim();

                if (!companyName) return; // Skip empty rows

                const errors: string[] = [];

                // Validate required field
                if (!companyName) {
                    errors.push("Şirket adı zorunludur");
                }

                // Validate website format
                if (websiteLink && !validateWebsite(websiteLink)) {
                    errors.push("Geçersiz website formatı (http:// veya https:// ile başlamalı)");
                }

                // Validate company size format
                if (companySize && !validateCompanySize(companySize)) {
                    errors.push("Geçersiz şirket büyüklüğü formatı (örn: 1-10, 50-100)");
                }

                const isValid = errors.length === 0;

                vendors.push({
                    id: `vendor-${index}-${Date.now()}`,
                    companyName,
                    websiteLink: websiteLink.startsWith("http") ? websiteLink : (websiteLink ? `https://${websiteLink}` : ""),
                    headquarters,
                    foundedAt,
                    companySize,
                    companyMotto,
                    companyDesc,
                    status: isValid ? "valid" : "invalid",
                    error: errors.length > 0 ? errors.join(", ") : undefined,
                });
            });

            const validCount = vendors.filter((v) => v.status === "valid").length;
            const invalidCount = vendors.filter((v) => v.status === "invalid").length;

            setParsedVendors(vendors);
            setImportResults(null);

            toast({
                title: "Dosya işlendi",
                description: `${vendors.length} şirket bulundu: ${validCount} geçerli, ${invalidCount} geçersiz.`,
            });
        } catch (error) {
            toast({
                title: "Hata",
                description: "Excel dosyası okunamadı.",
                variant: "destructive",
            });
        }
    }, [toast]);

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

    const handleRejectVendor = (vendorId: string) => {
        setParsedVendors((prev) => prev.filter((v) => v.id !== vendorId));
        toast({
            title: "Şirket çıkarıldı",
            description: "Şirket listeden çıkarıldı.",
        });
    };

    const handleRejectAllInvalid = () => {
        const invalidCount = parsedVendors.filter((v) => v.status === "invalid").length;
        setParsedVendors((prev) => prev.filter((v) => v.status !== "invalid"));
        toast({
            title: "Geçersiz şirketler çıkarıldı",
            description: `${invalidCount} geçersiz şirket listeden çıkarıldı.`,
        });
    };

    const handleImport = async () => {
        const validVendors = parsedVendors.filter((v) => v.status === "valid");

        if (validVendors.length === 0) return;

        setIsImporting(true);
        setImportResults(null);

        try {
            const vendorsToImport: BulkVendorInput[] = validVendors.map((v) => ({
                company_name: v.companyName,
                website_link: v.websiteLink || undefined,
                headquarters: v.headquarters || undefined,
                founded_at: v.foundedAt || undefined,
                company_size: v.companySize || undefined,
                company_motto: v.companyMotto || undefined,
                company_desc: v.companyDesc || undefined,
            }));

            const result = await adminBulkCreateVendors(vendorsToImport);

            setImportResults({
                success: result.success_count,
                failed: result.error_count,
                errors: result.errors.map((e) => ({ name: e.company_name, message: e.error })),
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
        setParsedVendors([]);
        setImportResults(null);
    };

    const validCount = parsedVendors.filter((v) => v.status === "valid").length;
    const invalidCount = parsedVendors.filter((v) => v.status === "invalid").length;
    const showVendorList = parsedVendors.length > 0;

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
                    {!showVendorList ? (
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
                                            Excel ile Toplu Şirket Ekle
                                        </h1>
                                        <p className="text-muted-foreground">
                                            Excel dosyanız aşağıdaki sırayla sütunlar içermelidir: Company Name, Website, Headquarters, Founded Year, Company Size, Motto, Description.
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
                                                İlk sayfa kullanılacaktır. Sütun sırası: Company Name, Website (opsiyonel), Headquarters (opsiyonel), Founded Year (opsiyonel), Company Size (opsiyonel), Motto (opsiyonel), Description (opsiyonel).
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
                                                <span className="font-medium">Company Name</span>
                                                <span className="text-destructive">*</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">2</Badge>
                                                <span>Website Link</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">3</Badge>
                                                <span>Headquarters</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">4</Badge>
                                                <span>Founded Year</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">5</Badge>
                                                <span>Company Size</span>
                                                <span className="text-muted-foreground text-xs">(ör: 1-10)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">6</Badge>
                                                <span>Company Motto</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">7</Badge>
                                                <span>Company Description</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <p className="text-xs text-muted-foreground">
                                                <strong>Otomatik değerler:</strong><br />
                                                • subscription: freemium<br />
                                                • is_verified: true<br />
                                                • user_id: NULL
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="vendor-list-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">Şirket Listesi</h1>
                                    <p className="text-muted-foreground">
                                        {parsedVendors.length} şirket • {validCount} geçerli • {invalidCount} geçersiz
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleReset} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Baştan Başla
                                </Button>
                            </div>

                            {/* Vendor List */}
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                        <AnimatePresence>
                                            {parsedVendors.map((vendor) => (
                                                <VendorRow
                                                    key={vendor.id}
                                                    vendor={vendor}
                                                    onReject={handleRejectVendor}
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
                                        {invalidCount} geçersiz şirket beklemede.
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
                                        {validCount} Şirketi İçe Aktar
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

interface VendorRowProps {
    vendor: ParsedVendor;
    onReject: (vendorId: string) => void;
}

const VendorRow = ({ vendor, onReject }: VendorRowProps) => {
    const getBorderColor = () => {
        switch (vendor.status) {
            case "valid":
                return "border-green-500/30 bg-green-500/5";
            case "invalid":
                return "border-destructive/30 bg-destructive/5 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]";
            default:
                return "";
        }
    };

    const getIcon = () => {
        switch (vendor.status) {
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
                <p className="font-medium text-foreground truncate">{vendor.companyName}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {vendor.headquarters && (
                        <span className="truncate">{vendor.headquarters}</span>
                    )}
                    {vendor.foundedAt && (
                        <span className="truncate">• {vendor.foundedAt}</span>
                    )}
                    {vendor.companySize && (
                        <Badge variant="secondary" className="text-xs">{vendor.companySize}</Badge>
                    )}
                </div>
                {vendor.websiteLink && (
                    <p className="text-sm text-muted-foreground truncate mt-1">{vendor.websiteLink}</p>
                )}
                {vendor.error && (
                    <p className="text-sm text-destructive mt-1">{vendor.error}</p>
                )}
            </div>

            {/* Status Label */}
            <div className="flex-shrink-0">
                {vendor.status === "valid" && (
                    <span className="text-sm font-medium text-green-600">Geçerli</span>
                )}
            </div>

            {/* Actions for Invalid */}
            {vendor.status === "invalid" && (
                <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 px-2"
                    onClick={() => onReject(vendor.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </motion.div>
    );
};

export default CompanyBulkUploadPage;
