import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Mail, Building2, Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight, Loader2, UserPlus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAdminVendors } from "@/hooks/useAdminUsers";
import ImageUpload from "@/components/admin/ImageUpload";
import { AdminVendorView, UserSearchResult } from "@/lib/admin-types";
import { Tier } from "@/lib/types";

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const UserSettingsTab = () => {
  // Local search input state (for debouncing)
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Edited user state (local form state)
  const [editedCompanyName, setEditedCompanyName] = useState("");
  const [editedCompanyWebsite, setEditedCompanyWebsite] = useState("");
  const [editedCompanySize, setEditedCompanySize] = useState("");
  const [editedHeadquarters, setEditedHeadquarters] = useState("");
  const [editedLinkedinLink, setEditedLinkedinLink] = useState("");
  const [editedInstagramLink, setEditedInstagramLink] = useState("");
  const [editedLogo, setEditedLogo] = useState("");
  const [editedCompanyMotto, setEditedCompanyMotto] = useState("");
  const [editedCompanyDesc, setEditedCompanyDesc] = useState("");
  const [editedFoundedAt, setEditedFoundedAt] = useState("");
  const [editedTier, setEditedTier] = useState<Tier>("freemium");

  // User assignment state
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const debouncedUserSearch = useDebounce(userSearchInput, 300);

  // Hook for admin vendor management
  const {
    vendors,
    totalCount,
    totalPages,
    currentPage,
    isLoading,
    error,
    setPage,
    setSearchQuery,
    selectedVendor,
    setSelectedVendor,
    updateTier,
    updateProfile,
    updateVerification,
    searchUsers,
    assignUserToVendor,
    isUpdatingTier,
    isUpdatingProfile,
    isUpdatingVerification,
    isAssigningUser,
  } = useAdminVendors();

  // Sync debounced search to hook
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Sync selected vendor to form fields
  useEffect(() => {
    if (selectedVendor) {
      setEditedCompanyName(selectedVendor.company_name ?? "");
      setEditedCompanyWebsite(selectedVendor.website_link ?? "");
      setEditedCompanySize(selectedVendor.company_size ?? "");
      setEditedHeadquarters(selectedVendor.headquarters ?? "");
      setEditedLinkedinLink(selectedVendor.linkedin_link ?? "");
      setEditedInstagramLink(selectedVendor.instagram_link ?? "");
      setEditedLogo(selectedVendor.logo ?? "");
      setEditedCompanyMotto(selectedVendor.company_motto ?? "");
      setEditedCompanyDesc(selectedVendor.company_desc ?? "");
      setEditedFoundedAt(selectedVendor.founded_at ?? "");
      setEditedTier(selectedVendor.subscription ?? "freemium");
    }
  }, [selectedVendor]);

  // Handle vendor selection
  const handleSelectVendor = useCallback((vendor: AdminVendorView) => {
    setSelectedVendor(vendor);
    // Clear user search when switching vendors
    setUserSearchInput("");
    setUserSearchResults([]);
  }, [setSelectedVendor]);

  // Search users when debounced input changes
  useEffect(() => {
    if (!userSearchOpen) {
      setUserSearchResults([]);
      return;
    }

    if (userSearchOpen) {
      setIsSearchingUsers(true);
      // Pass the query even if empty/short - API now handles it
      searchUsers(debouncedUserSearch).then((result) => {
        if (result.success && result.data) {
          setUserSearchResults(result.data);
        } else {
          setUserSearchResults([]);
        }
        setIsSearchingUsers(false);
      });
    } else {
      setUserSearchResults([]);
    }
  }, [debouncedUserSearch, searchUsers, userSearchOpen]);

  // Handle assigning a user to vendor
  const handleAssignUser = async (userId: string) => {
    if (!selectedVendor?.vendor_id) return;

    const result = await assignUserToVendor(selectedVendor.vendor_id, userId);

    if (result.success) {
      toast({
        title: "Kullanıcı atandı",
        description: "Kullanıcı başarıyla şirket'e bağlandı.",
      });
      setUserSearchInput("");
      setUserSearchResults([]);
    } else {
      toast({
        title: "Hata",
        description: result.error?.message || "Kullanıcı atanamadı.",
        variant: "destructive",
      });
    }
    setSearchInput("");
  };

  // Handle removing user from vendor
  const handleRemoveUser = async () => {
    if (!selectedVendor?.vendor_id) return;

    const result = await assignUserToVendor(selectedVendor.vendor_id, null);

    if (result.success) {
      toast({
        title: "Kullanıcı kaldırıldı",
        description: "Kullanıcı şirket'ten başarıyla kaldırıldı.",
      });
    } else {
      toast({
        title: "Hata",
        description: result.error?.message || "Kullanıcı kaldırılamadı.",
        variant: "destructive",
      });
    }
  };

  // Save company profile
  const handleSaveCompany = async () => {
    console.log('[handleSaveCompany] selectedVendor:', selectedVendor);
    console.log('[handleSaveCompany] vendor_id:', selectedVendor?.vendor_id);

    if (!selectedVendor?.vendor_id) {
      toast({
        title: "Hata",
        description: `Vendor seçilmedi. vendor_id: ${selectedVendor?.vendor_id}, user_id: ${selectedVendor?.user_id}`,
        variant: "destructive",
      });
      return;
    }

    const result = await updateProfile({
      vendorId: selectedVendor.vendor_id,
      companyName: editedCompanyName || undefined,
      companyWebsite: editedCompanyWebsite || undefined,
      companySize: editedCompanySize || undefined,
      headquarters: editedHeadquarters || undefined,
      linkedinLink: editedLinkedinLink || undefined,
      instagramLink: editedInstagramLink || undefined,
      logo: editedLogo || undefined,
      companyMotto: editedCompanyMotto || undefined,
      companyDesc: editedCompanyDesc || undefined,
      foundedAt: editedFoundedAt || undefined,
    });

    if (result.success) {
      toast({
        title: "Şirket bilgisi güncellendi",
        description: `${editedCompanyName || selectedVendor.company_name} bilgileri kaydedildi.`,
      });
    } else {
      toast({
        title: "Hata",
        description: result.error?.message || "Güncelleme başarısız.",
        variant: "destructive",
      });
    }
  };

  // Update tier
  const handleUpdateTier = async () => {
    console.log('[handleUpdateTier] selectedVendor:', selectedVendor);
    console.log('[handleUpdateTier] vendor_id:', selectedVendor?.vendor_id);

    if (!selectedVendor?.vendor_id) {
      toast({
        title: "Hata",
        description: `Vendor seçilmedi. vendor_id: ${selectedVendor?.vendor_id}, user_id: ${selectedVendor?.user_id}`,
        variant: "destructive",
      });
      return;
    }

    const result = await updateTier(selectedVendor.vendor_id, editedTier);

    if (result.success) {
      toast({
        title: "Tier güncellendi",
        description: `${selectedVendor.company_name || selectedVendor.user_email} için tier ${editedTier} olarak ayarlandı.`,
      });
    } else {
      toast({
        title: "Hata",
        description: result.error?.message || "Güncelleme başarısız.",
        variant: "destructive",
      });
    }
  };

  // Update verification status
  const handleUpdateVerification = async (newStatus: boolean) => {
    console.log('[handleUpdateVerification] selectedVendor:', selectedVendor);
    console.log('[handleUpdateVerification] newStatus:', newStatus);

    if (!selectedVendor?.vendor_id) {
      toast({
        title: "Hata",
        description: `Vendor seçilmedi.`,
        variant: "destructive",
      });
      return;
    }

    const result = await updateVerification(selectedVendor.vendor_id, newStatus);

    if (result.success) {
      toast({
        title: "Doğrulama durumu güncellendi",
        description: `${selectedVendor.company_name || selectedVendor.user_email} ${newStatus ? "doğrulandı" : "doğrulanmamış olarak işaretlendi"}.`,
      });
    } else {
      toast({
        title: "Hata",
        description: result.error?.message || "Güncelleme başarısız.",
        variant: "destructive",
      });
    }
  };

  // Tier badge color
  const getTierBadgeColor = (tier: string | null) => {
    switch (tier) {
      case "premium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "plus":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  // Get initials from company name or email
  const getInitials = (vendor: AdminVendorView) => {
    if (vendor.company_name) {
      return vendor.company_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (vendor.user_email) {
      return vendor.user_email.slice(0, 2).toUpperCase();
    }
    return "V";
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  // Loading skeleton for user list
  const UserListSkeleton = () => (
    <div className="space-y-2 p-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      ))}
    </div>
  );

  // Error state
  if (error && !isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="font-semibold text-lg text-foreground">Hata</h3>
            <p className="text-muted-foreground mt-1">{error.message}</p>
            {error.code === "NOT_ADMIN" && (
              <p className="text-sm text-muted-foreground mt-2">
                Bu sayfaya erişmek için admin yetkisi gerekiyor.
              </p>
            )}
          </div>
          <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Side - Vendor List */}
      <Card className="lg:col-span-1 flex flex-col max-h-[72vh]">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg">Şirketler</CardTitle>
          <CardDescription>
            Sistemdeki şirketleri yönetin ({totalCount} şirket)
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Şirket adı veya e-posta ara…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
          <ScrollArea className="flex-1">
            {isLoading ? (
              <UserListSkeleton />
            ) : vendors.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Şirket bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {vendors.map((vendor) => (
                  <button
                    key={vendor.vendor_id}
                    onClick={() => handleSelectVendor(vendor)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedVendor?.vendor_id === vendor.vendor_id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                      }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {getInitials(vendor)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {vendor.company_name || "İsimsiz Vendor"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {vendor.user_email || "E-posta bağlı değil"}
                      </p>
                    </div>
                    <Badge className={`text-xs capitalize ${getTierBadgeColor(vendor.subscription)}`}>
                      {vendor.subscription}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Side - Vendor Details */}
      <div className="lg:col-span-2 space-y-4">
        {selectedVendor ? (
          <>
            {/* Vendor Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Kullanıcı Bilgileri</CardTitle>
                </div>
                <CardDescription>Kullanıcı detayları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground h-5">
                      <Mail className="h-4 w-4" />
                      Bağlı E-posta
                    </Label>
                    <Input value={selectedVendor.user_email ?? "Bağlı değil"} disabled className="bg-muted h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="h-5">Onaylanma Durumu</Label>
                    <div className="flex items-center gap-3 h-8">
                      <Select
                        value={selectedVendor.is_verified ? "verified" : "unverified"}
                        onValueChange={(value) => handleUpdateVerification(value === "verified")}
                        disabled={isUpdatingVerification}
                      >
                        <SelectTrigger className="w-[180px] h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verified">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Onaylı
                            </span>
                          </SelectItem>
                          <SelectItem value="unverified">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              Onaylı Değil
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {isUpdatingVerification && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground h-5">
                      <Calendar className="h-4 w-4" />
                      Kayıt Tarihi
                    </Label>
                    <Input value={formatDate(selectedVendor.created_at)} disabled className="bg-muted h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground h-5">
                      <Clock className="h-4 w-4" />
                      Son Güncelleme
                    </Label>
                    <Input value={formatDate(selectedVendor.updated_at)} disabled className="bg-muted h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kullanıcı Atama */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Kullanıcı Bağlama</CardTitle>
                </div>
                <CardDescription>Şirket'e bir kullanıcı hesabı bağlayın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current assigned user */}
                <div className="space-y-2">
                  <Label>Mevcut Kullanıcı</Label>
                  {selectedVendor.user_id ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {selectedVendor.user_email?.slice(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{selectedVendor.user_email || "E-posta yok"}</p>
                          {selectedVendor.user_full_name && (
                            <p className="text-xs text-muted-foreground">{selectedVendor.user_full_name}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveUser}
                        disabled={isAssigningUser}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isAssigningUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        <span className="ml-1">Kaldır</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground">
                      <p className="text-sm">Kullanıcı bağlı değil</p>
                    </div>
                  )}
                </div>

                {/* User search */}
                <div className="space-y-2">
                  <Label>Yeni Kullanıcı Ara</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      placeholder="E-posta ile ara..."
                      value={userSearchInput}
                      onChange={(e) => setUserSearchInput(e.target.value)}
                      onFocus={() => setUserSearchOpen(true)}
                      onBlur={() => setTimeout(() => setUserSearchOpen(false), 200)}
                      className="pl-10"
                    />

                    {/* Dropdown list */}
                    {userSearchOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 border rounded-lg bg-popover shadow-md max-h-[220px] overflow-hidden">
                        {isSearchingUsers ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : userSearchResults.length > 0 ? (
                          <div className="max-h-[200px] overflow-y-auto p-1">
                            {userSearchResults.map((user) => (
                              <button
                                key={user.user_id}
                                type="button"
                                onClick={() => {
                                  handleAssignUser(user.user_id);
                                  setUserSearchOpen(false);
                                }}
                                disabled={isAssigningUser || !!user.assigned_vendor_id}
                                className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors ${user.assigned_vendor_id ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                      {user.email.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.email}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {user.full_name && (
                                        <span className="text-xs text-muted-foreground truncate">
                                          {user.full_name}
                                        </span>
                                      )}
                                      {user.assigned_vendor_name && (
                                        <span className="text-xs text-amber-600 truncate ml-1">
                                          • Mevcut: {user.assigned_vendor_name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isAssigningUser && user.user_id === selectedVendor?.user_id ? ( // This logic for spinner on specific item is tricky since selectedVendor might not match yet
                                    // Actually handleAssignUser is blocking toast so spinner is general?
                                    // "isAssigningUser" is global for the hook.
                                    // I'll just show text or general spinner if needed, but button disabled is enough.
                                    null
                                  ) : !user.assigned_vendor_id ? (
                                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">Bağla</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">Bağlı</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            Kullanıcı bulunamadı
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Removed logic for displaying results inline below */}
              </CardContent>
            </Card>

            {/* Şirket Bilgisi */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Şirket Bilgileri</CardTitle>
                </div>
                <CardDescription>
                  İlgili kayıtları günceller
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Şirket Adı</Label>
                    <Input
                      id="companyName"
                      value={editedCompanyName}
                      onChange={(e) => setEditedCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Şirket Web Sitesi</Label>
                    <Input
                      id="companyWebsite"
                      value={editedCompanyWebsite}
                      onChange={(e) => setEditedCompanyWebsite(e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Çalışan Sayısı</Label>
                    <Input
                      id="companySize"
                      value={editedCompanySize}
                      onChange={(e) => setEditedCompanySize(e.target.value)}
                      placeholder="ör: 1-10, 50-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headquarters">Ülke</Label>
                    <Input
                      id="headquarters"
                      value={editedHeadquarters}
                      onChange={(e) => setEditedHeadquarters(e.target.value)}
                      placeholder="ör: İstanbul, Türkiye"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinLink">LinkedIn</Label>
                    <Input
                      id="linkedinLink"
                      value={editedLinkedinLink}
                      onChange={(e) => setEditedLinkedinLink(e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagramLink">Instagram</Label>
                    <Input
                      id="instagramLink"
                      value={editedInstagramLink}
                      onChange={(e) => setEditedInstagramLink(e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <ImageUpload
                      value={editedLogo}
                      onChange={(value) => setEditedLogo(value)}
                      previewSize="sm"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="companyMotto">Şirket Mottosu</Label>
                    <Input
                      id="companyMotto"
                      value={editedCompanyMotto}
                      onChange={(e) => setEditedCompanyMotto(e.target.value)}
                      placeholder="Şirket sloganı veya mottosu"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="companyDesc">Şirket Hakkında</Label>
                    <textarea
                      id="companyDesc"
                      value={editedCompanyDesc}
                      onChange={(e) => setEditedCompanyDesc(e.target.value)}
                      placeholder="Şirket hakkında detaylı açıklama"
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foundedAt">Kuruluş Yılı</Label>
                    <Input
                      id="foundedAt"
                      type="date"
                      value={editedFoundedAt}
                      onChange={(e) => setEditedFoundedAt(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveCompany}
                  disabled={isUpdatingProfile}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kaydet
                </Button>
              </CardContent>
            </Card>

            {/* Tier & Abonelik */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Abonelik</CardTitle>
                <CardDescription>Freemium/Plus/Premium abonelikleri yönetin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tier">Üyelik</Label>
                  <Select
                    value={editedTier}
                    onValueChange={(value: Tier) => setEditedTier(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="plus">Plus</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleUpdateTier}
                  disabled={isUpdatingTier}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isUpdatingTier && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kaydet
                </Button>
              </CardContent>
            </Card>



          </>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-[400px]">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-muted-foreground">Detayları görmek için bir vendor seçin</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserSettingsTab;
