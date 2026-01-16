import { useState, useEffect, useRef } from "react";
import {
  User,
  Building2,
  CreditCard,
  Users,
  Megaphone,
  Save,
  Upload,
  Plus,
  Crown,
  Award,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/api/supabaseClient";
import { getVendorDetails, updateMyVendor } from "@/api/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";

type SettingsSection = "account" | "vendor" | "billing" | "team" | "campaigns";

const SettingsTab = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    company: user?.company || "",
    tagline: user?.tagline || "",
    website: user?.website || "",
    location: user?.location || "",
    phone: user?.phone || "",
    calendlyLink: user?.calendlyLink || "",
    notifications: user?.notifications !== undefined ? user.notifications : true,
    // Vendor profile fields
    companyName: "",
    logo: "",
    websiteLink: "",
    headquarters: "",
    companyMotto: "",
    instagramLink: "",
    linkedinLink: "",
    foundedAt: "",
    companySize: "",
  });

  // Password change dialog state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch vendor data and update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        company: user.company || "",
        tagline: user.tagline || "",
        website: user.website || "",
        location: user.location || "",
        phone: user.phone || "",
        calendlyLink: user.calendlyLink || "",
        notifications: user.notifications !== undefined ? user.notifications : true,
      }));

      // Fetch full vendor data
      if (user.vendorId) {
        getVendorDetails(user.vendorId)
          .then((vendorData) => {
            if (vendorData) {
              setFormData((prev) => ({
                ...prev,
                companyName: vendorData.company_name || "",
                logo: vendorData.logo || "",
                websiteLink: vendorData.website_link || "",
                headquarters: vendorData.headquarters || "",
                companyMotto: vendorData.company_motto || "",
                instagramLink: vendorData.instagram_link || "",
                linkedinLink: vendorData.linkedin_link || "",
                foundedAt: vendorData.founded_at
                  ? new Date(vendorData.founded_at).toISOString().split("T")[0]
                  : "",
                companySize: vendorData.company_size || "",
              }));
            }
          })
          .catch((error) => {
            console.error("Error fetching vendor data:", error);
          });
      }
    }
  }, [user]);

  if (!user) return null;

  const tierOrder = { freemium: 0, silver: 1, gold: 2 };
  const isGold = user.vendorTier === "gold";
  const isPaid = tierOrder[user.vendorTier] >= tierOrder.silver;

  const sections: { id: SettingsSection; label: string; icon: React.ReactNode; minTier?: "silver" | "gold" }[] =
    [
      { id: "account", label: t("settings.nav.account"), icon: <User className="w-4 h-4" /> },
      { id: "vendor", label: t("settings.nav.vendor"), icon: <Building2 className="w-4 h-4" /> },
      { id: "billing", label: t("settings.nav.billing"), icon: <CreditCard className="w-4 h-4" /> },
      { id: "team", label: t("settings.nav.team"), icon: <Users className="w-4 h-4" />, minTier: "gold" },
      {
        id: "campaigns",
        label: t("settings.nav.campaigns"),
        icon: <Megaphone className="w-4 h-4" />,
        minTier: "gold",
      },
    ];

  const visibleSections = sections.filter((s) => {
    if (!s.minTier) return true;
    return tierOrder[user.vendorTier] >= tierOrder[s.minTier];
  });

  const handleSave = async () => {
    try {
      // Update account settings
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          company: formData.company,
          phone: formData.phone,
          notifications: formData.notifications,
        },
      });

      if (error) {
        toast.error(t("settings.toast.saveAccountError"));
        console.error("Account update error:", error);
        return;
      }

      // Update vendor profile if user has a vendor
      if (user?.vendorId) {
        try {
          await updateMyVendor({
            companyName: formData.companyName || null,
            logo: formData.logo || null,
            websiteLink: formData.websiteLink || null,
            headquarters: formData.headquarters || null,
            companyMotto: formData.companyMotto || null,
            instagramLink: formData.instagramLink || null,
            linkedinLink: formData.linkedinLink || null,
            foundedAt: formData.foundedAt || null,
            companySize: formData.companySize || null,
          });
        } catch (vendorError) {
          toast.error(t("settings.toast.saveVendorError"));
          console.error("Vendor update error:", vendorError);
          return;
        }
      }

      updateUser({
        fullName: formData.fullName,
        company: formData.company,
        tagline: formData.tagline,
        website: formData.website,
        location: formData.location,
        phone: formData.phone,
        calendlyLink: formData.calendlyLink,
        notifications: formData.notifications,
      });

      toast.success(t("settings.toast.saveSuccess"));
    } catch (error) {
      toast.error(t("settings.toast.saveError"));
      console.error("Save error:", error);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("settings.password.errors.fillAll"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("settings.password.errors.minLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("settings.password.errors.mismatch"));
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(t("settings.password.errors.sameAsCurrent"));
      return;
    }

    setIsChangingPassword(true);

    try {
      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (verifyError) {
        toast.error(t("settings.password.errors.currentIncorrect"));
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(t("settings.password.errors.updateFailed"));
        console.error("Password update error:", updateError);
        setIsChangingPassword(false);
        return;
      }

      toast.success(t("settings.password.success"));
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(t("settings.password.errors.generic"));
      console.error("Password change error:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.vendor.logo.errors.invalidType"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.vendor.logo.errors.tooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, logo: base64String });
      toast.success(t("settings.vendor.logo.success"));
    };
    reader.onerror = () => {
      toast.error(t("settings.vendor.logo.errors.readFailed"));
    };
    reader.readAsDataURL(file);
  };

  const renderAccountSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("settings.account.title")}</h3>
        <div className="space-y-4">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("settings.account.fullName")}</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("settings.account.email")}</Label>
              <Input id="email" type="email" value={formData.email} disabled className="rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">{t("settings.account.password")}</Label>

            <Button variant="outline" className="rounded-xl" onClick={() => setShowPasswordDialog(true)}>
              {t("settings.account.changePassword")}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium text-foreground mb-4">{t("settings.account.notificationsTitle")}</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{t("settings.account.notificationsLabel")}</p>
            <p className="text-xs text-muted-foreground">{t("settings.account.notificationsDesc")}</p>
          </div>
          <Switch
            checked={formData.notifications}
            onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
          />
        </div>
      </div>
    </div>
  );

  const renderVendorSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("settings.vendor.title")}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.vendor.logo.label")}</Label>
            <div className="flex items-center gap-4">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt={t("settings.vendor.logo.alt")}
                  className="w-20 h-20 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center border border-dashed border-border">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  {t("settings.vendor.logo.upload")}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label={t("settings.vendor.logo.aria")}
                />
              </div>
            </div>
            <Input
              type="text"
              value={formData.logo || ""}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder={t("settings.vendor.logo.placeholder")}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">{t("settings.vendor.companyName")}</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="rounded-xl"
              placeholder={t("settings.vendor.companyNamePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyMotto">{t("settings.vendor.companyMotto")}</Label>
            <Input
              id="companyMotto"
              value={formData.companyMotto}
              onChange={(e) => setFormData({ ...formData, companyMotto: e.target.value })}
              placeholder={t("settings.vendor.companyMottoPlaceholder")}
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="websiteLink">{t("settings.vendor.website")}</Label>
              <Input
                id="websiteLink"
                type="url"
                value={formData.websiteLink}
                onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
                placeholder={t("settings.vendor.websitePlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinLink">{t("settings.vendor.linkedin")}</Label>
              <Input
                id="linkedinLink"
                type="url"
                value={formData.linkedinLink}
                onChange={(e) => setFormData({ ...formData, linkedinLink: e.target.value })}
                placeholder={t("settings.vendor.linkedinPlaceholder")}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagramLink">{t("settings.vendor.instagram")}</Label>
              <Input
                id="instagramLink"
                type="url"
                value={formData.instagramLink}
                onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
                placeholder={t("settings.vendor.instagramPlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headquarters">{t("settings.vendor.headquarters")}</Label>
              <Input
                id="headquarters"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                placeholder={t("settings.vendor.headquartersPlaceholder")}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="foundedAt">{t("settings.vendor.foundedAt")}</Label>
              <Input
                id="foundedAt"
                type="date"
                value={formData.foundedAt}
                onChange={(e) => setFormData({ ...formData, foundedAt: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">{t("settings.vendor.companySize")}</Label>
              <Input
                id="companySize"
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                placeholder={t("settings.vendor.companySizePlaceholder")}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("settings.billing.title")}</h3>

        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {user.vendorTier === "gold" && <Crown className="w-5 h-5 text-primary" />}
                {user.vendorTier === "silver" && <Award className="w-5 h-5 text-muted-foreground" />}
                <span className="text-lg font-semibold text-foreground capitalize">
                  {user.vendorTier}
                </span>
              </div>
              {isPaid && (
                <p className="text-sm text-muted-foreground">{t("settings.billing.nextBilling")}: January 15, 2025</p>
              )}
            </div>
            {user.vendorTier !== "gold" && (
              <Button className="rounded-full gap-2">
                <Crown className="w-4 h-4" />
                {t("settings.billing.upgrade")}
              </Button>
            )}
          </div>

          {user.vendorTier === "freemium" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("settings.billing.freemiumNote")}</p>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">{t("settings.billing.unlockSilverTitle")}</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("settings.billing.unlockSilver1")}</li>
                  <li>• {t("settings.billing.unlockSilver2")}</li>
                  <li>• {t("settings.billing.unlockSilver3")}</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">{t("settings.billing.unlockGoldTitle")}</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("settings.billing.unlockGold1")}</li>
                  <li>• {t("settings.billing.unlockGold2")}</li>
                  <li>• {t("settings.billing.unlockGold3")}</li>
                </ul>
              </div>
            </div>
          )}

          {isPaid && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">{t("settings.billing.products")}</p>
                  <p className="text-2xl font-bold text-foreground">4</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">{t("settings.billing.totalViews")}</p>
                  <p className="text-2xl font-bold text-foreground">2,847</p>
                </div>
              </div>
              {isGold && (
                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="rounded-xl">
                    {t("settings.billing.invoiceHistory")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {isPaid && (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">{t("settings.billing.paymentMethod")}</h4>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-muted rounded flex items-center justify-center text-xs font-bold">
                  VISA
                </div>
                <span className="text-sm text-foreground">•••• 4242</span>
              </div>
              <Button variant="ghost" size="sm">
                {t("settings.billing.updatePayment")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeamSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("settings.team.title")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("settings.team.subtitle")}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-foreground">AJ</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
              {t("settings.team.admin")}
            </span>
          </div>
        </div>

        <Button variant="outline" className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          {t("settings.team.invite")}
        </Button>
      </div>
    </div>
  );

  const renderCampaignsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("settings.campaigns.title")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("settings.campaigns.subtitle")}</p>

        <div className="bg-muted/30 rounded-xl border border-border p-6 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{t("settings.campaigns.empty")}</p>
          <Button className="rounded-full gap-2">
            <Plus className="w-4 h-4" />
            {t("settings.campaigns.create")}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return renderAccountSection();
      case "vendor":
        return renderVendorSection();
      case "billing":
        return renderBillingSection();
      case "team":
        return renderTeamSection();
      case "campaigns":
        return renderCampaignsSection();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="md:w-56 shrink-0">
        <nav className="space-y-1">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-card rounded-xl border border-border p-6">
          {renderContent()}

          {activeSection !== "billing" && (
            <div className="mt-6 pt-6 border-t border-border flex justify-end">
              <Button onClick={handleSave} className="rounded-full gap-2">
                <Save className="w-4 h-4" />
                {t("settings.common.saveChanges")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("settings.password.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("settings.password.dialogDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("settings.password.current")}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="rounded-xl pr-10"
                  placeholder={t("settings.password.currentPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.password.new")}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl pr-10"
                  placeholder={t("settings.password.newPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("settings.password.confirm")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl pr-10"
                  placeholder={t("settings.password.confirmPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="rounded-xl"
            >
              {t("settings.common.cancel")}
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword} className="rounded-xl">
              {isChangingPassword ? t("settings.password.changing") : t("settings.password.change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsTab;
