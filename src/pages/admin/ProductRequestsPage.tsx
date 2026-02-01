import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, MoreHorizontal, FileText, UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/api/supabaseClient";
import { ListingStatus } from "@/lib/admin-types";

interface ListingRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorMotto?: string;
  name: string;
  shortDescription: string;
  websiteUrl: string;
  logo: string;
  categories: string[];
  features: string[];
  productTier: string;
  status: ListingStatus;
  submittedAt: Date;
  adminComment?: string;
}

interface OwnershipRequest {
  id: string;
  claimedVendorId: string;
  claimedVendorName: string;
  claimerVendorId: string;
  claimerVendorName: string;
  claimerUserId?: string;
  claimerUserEmail?: string;
  claimerUserFullName?: string;
  status: ListingStatus;
  submittedAt: Date;
  message?: string;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

type ProductRow = {
  product_id: string;
  vendor_id: string;
  product_name: string;
  short_desc: string | null;
  website_link: string | null;
  logo: string | null;
  main_category: string | null;
  categories: string[] | null;
  features: string[] | null;
  listing_status: ListingStatus;
  created_at: string;
  company_name: string | null;
  subscription: string | null;
  company_motto: string | null;
};

type OwnershipRow = {
  id: string;
  claimed_vendor_id: string;
  claimed_vendor_name: string | null;
  claimer_vendor_id: string;
  claimer_vendor_name: string | null;
  claimer_user_id: string | null;
  user_email: string | null;
  user_full_name: string | null;
  status: ListingStatus;
  message: string | null;
  created_at: string;
};

const ProductRequestsPage = () => {
  const navigate = useNavigate();
  const [listingRequests, setListingRequests] = useState<ListingRequest[]>([]);
  const [ownershipRequests, setOwnershipRequests] = useState<OwnershipRequest[]>([]);
  const [listingLoading, setListingLoading] = useState(true);
  const [ownershipLoading, setOwnershipLoading] = useState(true);
  
  // Filter states
  const [listingFilter, setListingFilter] = useState<FilterStatus>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<FilterStatus>("all");
  
  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedOwnershipId, setSelectedOwnershipId] = useState<string | null>(null);
  
  // Details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ListingRequest | null>(null);
  const [selectedOwnership, setSelectedOwnership] = useState<OwnershipRequest | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [toast]);

  const loadListingRequests = useCallback(async () => {
    setListingLoading(true);
    const { data, error } = await supabase.rpc("admin_get_product_requests");

    if (error) {
      toast({
        title: "Liste başvuruları yüklenemedi",
        description: error.message,
        variant: "destructive",
      });
      setListingRequests([]);
      setListingLoading(false);
      return;
    }

    const mapped = ((data ?? []) as ProductRow[]).map((row) => {
      const categorySet = new Set<string>();
      if (row.main_category) {
        categorySet.add(row.main_category);
      }
      (row.categories ?? []).forEach((category) => categorySet.add(category));

      return {
        id: row.product_id,
        vendorId: row.vendor_id,
        vendorName: row.company_name ?? "Bilinmeyen Şirket",
        vendorMotto: row.company_motto ?? undefined,
        name: row.product_name,
        shortDescription: row.short_desc ?? "",
        websiteUrl: row.website_link ?? "",
        logo: row.logo ?? "",
        categories: Array.from(categorySet),
        features: row.features ?? [],
        productTier: row.subscription ?? "freemium",
        status: row.listing_status,
        submittedAt: new Date(row.created_at),
      };
    });

    setListingRequests(mapped);
    setListingLoading(false);
  }, [toast]);

  const loadOwnershipRequests = useCallback(async () => {
    setOwnershipLoading(true);
    const { data, error } = await supabase.rpc("admin_get_ownership_requests");

    if (error) {
      toast({
        title: "Sahiplik talepleri yüklenemedi",
        description: error.message,
        variant: "destructive",
      });
      setOwnershipRequests([]);
      setOwnershipLoading(false);
      return;
    }

    const mapped = ((data ?? []) as OwnershipRow[]).map((row) => ({
      id: row.id,
      claimedVendorId: row.claimed_vendor_id,
claimedVendorName: row.claimed_vendor_name ?? "Bilinmeyen Şirket",
        claimerVendorId: row.claimer_vendor_id,
        claimerVendorName: row.claimer_vendor_name ?? "Bilinmeyen Şirket",
      claimerUserId: row.claimer_user_id ?? undefined,
      claimerUserEmail: row.user_email ?? undefined,
      claimerUserFullName: row.user_full_name ?? undefined,
      status: row.status,
      submittedAt: new Date(row.created_at),
      message: row.message ?? undefined,
    }));

    setOwnershipRequests(mapped);
    setOwnershipLoading(false);
  }, [toast]);

  useEffect(() => {
    loadListingRequests();
    loadOwnershipRequests();

    const channel = supabase
      .channel("admin-product-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadListingRequests();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ownership_requests" },
        () => {
          loadOwnershipRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadListingRequests, loadOwnershipRequests]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (listingFilter === "all") {
      return listingRequests;
    }
    return listingRequests.filter((app) => app.status === listingFilter);
  }, [listingFilter, listingRequests]);

  // Filter ownership requests
  const filteredOwnershipRequests = useMemo(() => {
    if (ownershipFilter === "all") {
      return ownershipRequests;
    }
    return ownershipRequests.filter((req) => req.status === ownershipFilter);
  }, [ownershipFilter, ownershipRequests]);

  // Get status badge
  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Beklemede</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"><CheckCircle className="h-3 w-3 mr-1" />Onaylı</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle listing approve
  const handleListingApprove = async (id: string) => {
    const { error } = await supabase.rpc("admin_update_product_listing_status", {
      p_product_id: id,
      p_status: "approved",
    });

    if (error) {
      toast({
        title: "Başvuru onaylanamadı",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Başvuru Onaylandı",
      description: "Liste başvurusu onaylandı ve ürün yayına alındı.",
    });
    loadListingRequests();
  };

  // Handle listing reject - open dialog
  const handleListingRejectClick = (id: string) => {
    setSelectedListingId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  // Confirm listing rejection
  const confirmListingReject = () => {
    if (selectedListingId) {
      handleListingStatusUpdate(selectedListingId, "rejected");
    }
    setRejectDialogOpen(false);
    setSelectedListingId(null);
    setRejectReason("");
  };

  // Change listing status
  const handleListingStatusUpdate = async (id: string, newStatus: ListingStatus) => {
    const { error } = await supabase.rpc("admin_update_product_listing_status", {
      p_product_id: id,
      p_status: newStatus,
    });

    if (error) {
      toast({
        title: "Başvuru durumu güncellenemedi",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Durum Güncellendi",
      description: `Başvuru durumu "${newStatus}" olarak güncellendi.`,
    });
    loadListingRequests();
  };

  // Handle ownership approve
  const handleOwnershipApprove = async (id: string) => {
    const { error } = await supabase.rpc("ownership_request_approve", {
      p_request_id: id,
    });

    if (error) {
      toast({
        title: "Sahiplik onaylanamadı",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const request = ownershipRequests.find((r) => r.id === id);
    toast({
      title: "Sahiplik Onaylandı",
      description: `${request?.claimerVendorName ?? "Şirket"} -> ${request?.claimedVendorName ?? "Şirket"} birleştirildi.`,
    });
    loadOwnershipRequests();
  };

  // Handle ownership reject - open dialog
  const handleOwnershipRejectClick = (id: string) => {
    setSelectedOwnershipId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  // Confirm ownership rejection
  const confirmOwnershipReject = () => {
    if (selectedOwnershipId) {
      handleOwnershipStatusUpdate(selectedOwnershipId, "rejected");
    }
    setRejectDialogOpen(false);
    setSelectedOwnershipId(null);
    setRejectReason("");
  };

  // Change ownership status
  const handleOwnershipStatusUpdate = async (id: string, newStatus: ListingStatus) => {
    const { error } = await supabase.rpc("admin_update_ownership_request_status", {
      p_request_id: id,
      p_status: newStatus,
    });

    if (error) {
      toast({
        title: "Talep durumu güncellenemedi",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Durum Güncellendi",
      description: `Talep durumu "${newStatus}" olarak güncellendi.`,
    });
    loadOwnershipRequests();
  };

  // Open listing details
  const openListingDetails = (app: ListingRequest) => {
    setSelectedApplication(app);
    setSelectedOwnership(null);
    setDetailsDialogOpen(true);
  };

  // Open ownership details
  const openOwnershipDetails = (req: OwnershipRequest) => {
    setSelectedOwnership(req);
    setSelectedApplication(null);
    setDetailsDialogOpen(true);
  };

  const filterButtons = (filter: FilterStatus, setFilter: (f: FilterStatus) => void) => (
    <div className="flex gap-1 flex-wrap">
      {[
        { value: "all" as FilterStatus, label: "Tümü" },
        { value: "pending" as FilterStatus, label: "Beklemede" },
        { value: "approved" as FilterStatus, label: "Onaylı" },
        { value: "rejected" as FilterStatus, label: "Reddedildi" },
      ].map(({ value, label }) => (
        <Button
          key={value}
          variant={filter === value ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(value)}
          className="text-xs"
        >
          {label}
        </Button>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate("/admin")} className="hover:text-foreground transition-colors">
            Admin Paneli
          </button>
          <span>/</span>
          <button onClick={() => navigate("/admin/products")} className="hover:text-foreground transition-colors">
            Ürün Ayarları
          </button>
          <span>/</span>
          <span className="text-foreground">Talepler</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin/products")} className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Talepler</h1>
          <p className="text-muted-foreground mt-2">Listeleme ve sahiplik isteklerini yönetin.</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste Başvuruları */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Liste Başvuruları</CardTitle>
                  <CardDescription>listing_requests akışı</CardDescription>
                </div>
              </div>
              <div className="pt-2">
                {filterButtons(listingFilter, setListingFilter)}
              </div>
            </CardHeader>
            <CardContent>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{listingLoading ? "Başvurular yükleniyor..." : "Henüz başvuru bulunmuyor."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openListingDetails(app)}
                    >
                      <img
                        src={app.logo}
                        alt={app.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{app.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {app.vendorName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(app.status)}
                        {app.status === "pending" ? (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleListingApprove(app.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleListingRejectClick(app.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 px-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleListingStatusUpdate(app.id, "pending")}>
                                  Beklemede Yap
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleListingStatusUpdate(app.id, "approved")}>
                                  Onayla
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleListingStatusUpdate(app.id, "rejected")}>
                                  Reddet
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sahiplik Talepleri */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Sahiplik Talepleri</CardTitle>
                  <CardDescription>ownership_requests akışı</CardDescription>
                </div>
              </div>
              <div className="pt-2">
                {filterButtons(ownershipFilter, setOwnershipFilter)}
              </div>
            </CardHeader>
            <CardContent>
              {filteredOwnershipRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{ownershipLoading ? "Talepler yükleniyor..." : "Henüz talep bulunmuyor."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOwnershipRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openOwnershipDetails(req)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{req.claimerVendorName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          Talep Edilen: {req.claimedVendorName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(req.status)}
                        {req.status === "pending" ? (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleOwnershipApprove(req.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleOwnershipRejectClick(req.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 px-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOwnershipStatusUpdate(req.id, "pending")}>
                                  Beklemede Yap
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOwnershipApprove(req.id)}>
                                  Onayla
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOwnershipStatusUpdate(req.id, "rejected")}>
                                  Reddet
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reddetme Nedeni</DialogTitle>
              <DialogDescription>
                İsteğe bağlı olarak reddetme nedenini belirtin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Neden (Opsiyonel)</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="Reddetme nedeninizi yazın..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={selectedListingId ? confirmListingReject : confirmOwnershipReject}
              >
                Reddet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedApplication ? "Başvuru Detayları" : "Talep Detayları"}
              </DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedApplication.logo}
                    alt={selectedApplication.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{selectedApplication.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedApplication.vendorName}</p>
                  </div>
                  {getStatusBadge(selectedApplication.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Açıklama:</span>
                    <p className="text-foreground">{selectedApplication.shortDescription}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Website:</span>
                    <p className="text-foreground">{selectedApplication.websiteUrl}</p>
                  </div>
                  {selectedApplication.vendorMotto && (
                    <div>
                      <span className="font-medium text-muted-foreground">Motto:</span>
                      <p className="text-foreground">{selectedApplication.vendorMotto}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-muted-foreground">Kategoriler:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.categories.map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Özellikler:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.features.map(feat => (
                        <Badge key={feat} variant="outline" className="text-xs">{feat}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Tier:</span>
                    <Badge variant="outline" className="ml-2 capitalize">{selectedApplication.productTier}</Badge>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Başvuru Tarihi:</span>
                    <span className="ml-2">{selectedApplication.submittedAt.toLocaleDateString("tr-TR")}</span>
                  </div>
                  {selectedApplication.adminComment && (
                    <div>
                      <span className="font-medium text-muted-foreground">Admin Notu:</span>
                      <p className="text-foreground bg-muted p-2 rounded mt-1">{selectedApplication.adminComment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {selectedOwnership && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedOwnership.claimerVendorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOwnership.claimerUserFullName ?? "Kullanıcı"}
                      {selectedOwnership.claimerUserEmail ? ` • ${selectedOwnership.claimerUserEmail}` : ""}
                    </p>
                    {selectedOwnership.claimerUserId && (
                      <p className="text-xs text-muted-foreground">Kullanıcı ID: {selectedOwnership.claimerUserId}</p>
                    )}
                  </div>
                  {getStatusBadge(selectedOwnership.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Talep Eden Şirket:</span>
                    <p className="text-foreground">{selectedOwnership.claimerVendorName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Talep Edilen Şirket:</span>
                    <p className="text-foreground">{selectedOwnership.claimedVendorName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Talep Tarihi:</span>
                    <span className="ml-2">{selectedOwnership.submittedAt.toLocaleDateString("tr-TR")}</span>
                  </div>
                  {selectedOwnership.message && (
                    <div>
                      <span className="font-medium text-muted-foreground">Mesaj:</span>
                      <p className="text-foreground bg-muted p-2 rounded mt-1">{selectedOwnership.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ProductRequestsPage;
