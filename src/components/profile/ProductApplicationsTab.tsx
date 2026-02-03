import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Eye, Edit, Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useProductApplications, ProductStatus } from "@/contexts/ProductApplicationsContext";
import ListingTierBadge from "@/components/ListingTierBadge";

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending: {
    label: "Beklemede",
    icon: <Clock className="w-3.5 h-3.5" />,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  approved: {
    label: "Onaylandı",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  rejected: {
    label: "Reddedildi",
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  changes_requested: {
    label: "Revizyon Gerekli",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
};

const ProductApplicationsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getApplicationsByVendor, isLoading, error } = useProductApplications();

  const applications = getApplicationsByVendor(user?.vendorId || "");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-2">Başvurular yükleniyor</h3>
          <p className="text-muted-foreground text-sm">Lütfen bekleyin...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-2">Başvurular yüklenemedi</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-2">Henüz başvuru yok</h3>
          <p className="text-muted-foreground text-sm mb-4">
            İlk çözüm başvurunuzu oluşturarak başlayın.
          </p>
          <Button onClick={() => navigate("/profile/products/new")}>Yeni Çözüm Ekle</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            Çözüm başvurularınız burada listelenir. Onaylanan çözümler otomatik olarak{" "}
            <span className="font-medium text-foreground">Çözümlerim</span> sekmesine taşınır ve
            kamuya açık hale gelir.
          </p>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Çözüm</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Başvuru Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => {
                const statusConfig = STATUS_CONFIG[app.status];
                return (
                  <TableRow key={app.id}>
                    {/* Product Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={app.logo}
                          alt={app.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border"
                        />
                        <div>
                          <p className="font-medium text-foreground">{app.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {app.shortDescription}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {app.categories[0] || "-"}
                      </span>
                    </TableCell>

                    {/* Tier Badge */}
                    <TableCell>
                      <ListingTierBadge tier={app.productTier} />
                    </TableCell>

                    {/* Submission Date */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(app.submittedAt, "dd MMM yyyy", { locale: tr })}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1.5 w-fit ${statusConfig.className}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                      {app.status === "changes_requested" && app.adminComment && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-amber-600 mt-1 cursor-help underline decoration-dotted">
                              Detay için tıklayın
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[300px]">
                            <p className="text-sm">{app.adminComment}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {app.status === "rejected" && app.adminComment && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-destructive mt-1 cursor-help underline decoration-dotted">
                              Red gerekçesi
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[300px]">
                            <p className="text-sm">{app.adminComment}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === "approved" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Çözümü görüntüle</TooltipContent>
                          </Tooltip>
                        )}
                        {app.status === "changes_requested" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Düzenle ve tekrar gönder</TooltipContent>
                          </Tooltip>
                        )}
                        {app.status === "pending" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Başvuruyu görüntüle</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductApplicationsTab;
