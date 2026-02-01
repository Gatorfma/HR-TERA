import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Building2, Link as LinkIcon, Save, AlertTriangle, Loader2, Search, UserPlus, X, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import ImageUpload from "@/components/admin/ImageUpload";
import { adminCreateVendor, adminSearchUsers } from "@/api/adminUserApi";
import { UserSearchResult } from "@/lib/admin-types";
import { Tier } from "@/lib/types";
import { CountrySelect } from "@/components/ui/country-select";

// Debounce hook
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

interface FormData {
  companyName: string;
  companySize: string;
  companyMotto: string;
  companyDesc: string;
  headquarters: string;
  foundedAt: string;
  websiteLink: string;
  linkedinLink: string;
  instagramLink: string;
  logo: string;
  subscription: Tier;
  isVerified: boolean;
}

const CompanyCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    companySize: "",
    companyMotto: "",
    companyDesc: "",
    headquarters: "",
    foundedAt: "",
    websiteLink: "",
    linkedinLink: "",
    instagramLink: "",
    logo: "",
    subscription: "freemium",
    isVerified: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // User assignment state
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const debouncedUserSearch = useDebounce(userSearchInput, 300);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Search users when debounced input changes
  useEffect(() => {
    if (!userSearchOpen) {
      setUserSearchResults([]);
      return;
    }

    if (userSearchOpen) {
      setIsSearchingUsers(true);
      // Pass the query even if empty/short - API now handles it
      adminSearchUsers(debouncedUserSearch).then((result) => {
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
  }, [debouncedUserSearch, userSearchOpen]);

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setUserSearchInput("");
    setUserSearchResults([]);
  };

  const handleRemoveUser = () => {
    setSelectedUser(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Şirket adı zorunludur";
    }

    // Validate company size format if provided
    if (formData.companySize.trim() && !/^[0-9]+-[0-9]+$/.test(formData.companySize.trim())) {
      newErrors.companySize = 'Geçersiz format. Örnek: "1-10" veya "50-100"';
    }

    // Validate website URL if provided
    if (formData.websiteLink.trim() && !/^https?:\/\//.test(formData.websiteLink.trim())) {
      newErrors.websiteLink = "URL http:// veya https:// ile başlamalı";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurunuz.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await adminCreateVendor({
        companyName: formData.companyName.trim() || null,
        userId: selectedUser?.user_id || null,
        isVerified: formData.isVerified,
        companySize: formData.companySize.trim() || null,
        companyMotto: formData.companyMotto.trim() || null,
        companyDesc: formData.companyDesc.trim() || null,
        headquarters: formData.headquarters.trim() || null,
        foundedAt: formData.foundedAt ? `${formData.foundedAt}-01-01` : null,
        websiteLink: formData.websiteLink.trim() || null,
        linkedinLink: formData.linkedinLink.trim() || null,
        instagramLink: formData.instagramLink.trim() || null,
        logo: formData.logo.trim() || null,
        subscription: formData.subscription,
      });

      if (result.success) {
        toast({
          title: "Şirket başarıyla oluşturuldu",
          description: `"${formData.companyName}" şirketi eklendi. ID: ${result.data}`,
        });

        // Navigate to edit page
        navigate("/admin/companies/edit");
      } else {
        toast({
          title: "Hata",
          description: result.error?.message || "Şirket oluşturulamadı",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Şirket oluşturulamadı",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

        <h1 className="text-3xl font-bold text-foreground">Yeni Şirket Oluştur</h1>
        <p className="text-muted-foreground mt-2 mb-8">Yeni bir şirket (vendor) kaydı oluşturun.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Şirket Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Şirket Bilgileri</CardTitle>
                    <CardDescription>Temel şirket bilgileri</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Şirket Adı */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Şirket Adı *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Şirket adı"
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-500">{errors.companyName}</p>
                  )}
                </div>

                {/* Şirket Büyüklüğü */}
                <div className="space-y-2">
                  <Label htmlFor="companySize">Şirket Büyüklüğü</Label>
                  <Input
                    id="companySize"
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    placeholder='ör: 1-10, 50-100, 500-1000'
                    className={errors.companySize ? "border-red-500" : ""}
                  />
                  {errors.companySize && (
                    <p className="text-xs text-red-500">{errors.companySize}</p>
                  )}
                </div>

                {/* Merkez */}
                <div className="space-y-2">
                  <Label htmlFor="headquarters">Merkez</Label>
                  <CountrySelect
                    value={formData.headquarters}
                    onChange={(value) => setFormData({ ...formData, headquarters: value })}
                    placeholder="Ülke seçiniz..."
                  />
                </div>

                {/* Kuruluş Tarihi */}
                <div className="space-y-2">
                  <Label htmlFor="foundedAt">Kuruluş Yılı</Label>
                  <Select
                    value={formData.foundedAt}
                    onValueChange={(value) => setFormData({ ...formData, foundedAt: value })}
                  >
                    <SelectTrigger id="foundedAt" className="w-full">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Şirket Mottosu */}
                <div className="space-y-2">
                  <Label htmlFor="companyMotto">Şirket Mottosu</Label>
                  <Input
                    id="companyMotto"
                    value={formData.companyMotto}
                    onChange={(e) => setFormData({ ...formData, companyMotto: e.target.value })}
                    placeholder="Şirket sloganı veya mottosu"
                  />
                </div>

                {/* Şirket Açıklaması */}
                <div className="space-y-2">
                  <Label htmlFor="companyDesc">Şirket Açıklaması</Label>
                  <Textarea
                    id="companyDesc"
                    value={formData.companyDesc}
                    onChange={(e) => setFormData({ ...formData, companyDesc: e.target.value })}
                    placeholder="Şirket hakkında detaylı açıklama"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Kullanıcı Atama */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Kullanıcı Atama</CardTitle>
                    <CardDescription>Şirkete bir kullanıcı hesabı bağlayın (opsiyonel)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected user */}
                {selectedUser ? (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {selectedUser.email.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedUser.email}</p>
                        {selectedUser.full_name && (
                          <p className="text-xs text-muted-foreground">{selectedUser.full_name}</p>
                        )}
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveUser}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* User search */}
                    <div className="space-y-2">
                      <Label>Kullanıcı Ara</Label>
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
                                      handleSelectUser(user);
                                      setUserSearchOpen(false);
                                    }}
                                    disabled={!!user.assigned_vendor_id}
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
                                    {!user.assigned_vendor_id && (
                                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">Seç</span>
                                    )}
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Bağlantılar & Medya */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <LinkIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Bağlantılar & Medya</CardTitle>
                    <CardDescription>Website, sosyal medya ve logo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="websiteLink">Website</Label>
                  <Input
                    id="websiteLink"
                    value={formData.websiteLink}
                    onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
                    placeholder="https://"
                    className={errors.websiteLink ? "border-red-500" : ""}
                  />
                  {errors.websiteLink && (
                    <p className="text-xs text-red-500">{errors.websiteLink}</p>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedinLink">LinkedIn</Label>
                  <Input
                    id="linkedinLink"
                    value={formData.linkedinLink}
                    onChange={(e) => setFormData({ ...formData, linkedinLink: e.target.value })}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label htmlFor="instagramLink">Instagram</Label>
                  <Input
                    id="instagramLink"
                    value={formData.instagramLink}
                    onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <ImageUpload
                    value={formData.logo}
                    onChange={(value) => setFormData({ ...formData, logo: value })}
                    previewSize="md"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tier & Doğrulama */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Badge className="h-5 w-5 text-primary p-0 flex items-center justify-center">T</Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Tier & Doğrulama</CardTitle>
                    <CardDescription>Abonelik seviyesi ve doğrulama durumu</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subscription Tier */}
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select
                    value={formData.subscription}
                    onValueChange={(value: Tier) => setFormData({ ...formData, subscription: value })}
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

                {/* Verification */}
                <div className="space-y-2">
                  <Label>Doğrulama Durumu</Label>
                  <Select
                    value={formData.isVerified ? "verified" : "unverified"}
                    onValueChange={(value) => setFormData({ ...formData, isVerified: value === "verified" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verified">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Doğrulanmış
                        </span>
                      </SelectItem>
                      <SelectItem value="unverified">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Doğrulanmamış
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Card: Kaydet */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Save className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Kaydet</CardTitle>
                <CardDescription>Şirketi veritabanına ekle</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <p className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Şirket kaydedildikten sonra "Şirket Düzenleme" sayfasından düzenleyebilirsiniz.
              </p>
              <p>• vendor_id otomatik olarak oluşturulacaktır.</p>
              {selectedUser && (
                <p>• Kullanıcı "{selectedUser.email}" bu şirkete bağlanacak.</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/admin?tab=users")}>
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CompanyCreatePage;
