import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, CreditCard, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhoneInput from "@/components/PhoneInput";
import ListingTierBadge from "@/components/ListingTierBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/api/supabaseClient";
import { submitOwnershipRequest, updateMyVendorProfile } from "@/api/supabaseApi";
import { Tier } from "@/lib/types";

interface UnclaimedVendorSectionProps {
  claimedVendorId?: string | null;
}

const phoneRegex = /^\+\d{7,15}$/;
const companySizeRegex = /^\d+-\d+$/;
const websiteRegex = /^https?:\/\//i;

const UnclaimedVendorSection = ({ claimedVendorId }: UnclaimedVendorSectionProps) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier>("freemium");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    companySize: "",
    website: "",
    message: "",
  });

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      companyName: user.company || "",
      website: user.website || "",
    }));
  }, [user]);

  const openAuthModal = () => {
    toast({
      title: t("common.error"),
      description: t("ownership.loginRequired"),
      variant: "destructive",
    });
    window.dispatchEvent(new CustomEvent("open-auth-modal"));
  };

  const tierOptions = [
    {
      id: "freemium" as const,
      name: t("ownership.tierFreemiumLabel"),
      subtitle: t("ownership.tierFreemiumSubtitle"),
      price: t("ownership.tierFreemiumPrice"),
      description: t("ownership.tierFreemiumDesc"),
    },
    {
      id: "silver" as const,
      name: t("ownership.tierSilverLabel"),
      subtitle: t("ownership.tierSilverSubtitle"),
      price: t("ownership.tierSilverPrice"),
      description: t("ownership.tierSilverDesc"),
    },
    {
      id: "gold" as const,
      name: t("ownership.tierGoldLabel"),
      subtitle: t("ownership.tierGoldSubtitle"),
      price: t("ownership.tierGoldPrice"),
      description: t("ownership.tierGoldDesc"),
    },
  ];

  const selectedTierLabel =
    tierOptions.find((tier) => tier.id === selectedTier)?.name ?? selectedTier;
  const previewName = formData.companyName.trim() || t("ownership.previewCompanyFallback");
  const previewWebsite = formData.website.trim()
    ? formData.website.trim().replace(/^https?:\/\//, "")
    : t("ownership.previewWebsiteFallback");
  const paymentDescription =
    selectedTier === "freemium" ? t("ownership.paymentDesc") : t("ownership.paymentComingSoon");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!claimedVendorId) {
      toast({
        title: t("common.error"),
        description: t("ownership.vendorMissing"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.fullName.trim()) {
      toast({
        title: t("common.error"),
        description: t("ownership.fullNameRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.companyName.trim()) {
      toast({
        title: t("common.error"),
        description: t("ownership.companyRequired"),
        variant: "destructive",
      });
      return;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast({
        title: t("common.error"),
        description: t("auth.invalidPhone"),
        variant: "destructive",
      });
      return;
    }

    const normalizedWebsite = formData.website.trim();
    if (normalizedWebsite && !websiteRegex.test(normalizedWebsite)) {
      toast({
        title: t("common.error"),
        description: t("ownership.websiteInvalid"),
        variant: "destructive",
      });
      return;
    }

    const normalizedCompanySize = formData.companySize.trim();
    if (normalizedCompanySize && !companySizeRegex.test(normalizedCompanySize)) {
      toast({
        title: t("common.error"),
        description: t("ownership.companySizeInvalid"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName.trim(),
          phone: formData.phone || null,
          company: formData.companyName.trim(),
        },
      });

      if (authError) {
        throw authError;
      }

      const vendorUpdated = await updateMyVendorProfile({
        companyName: formData.companyName.trim() || null,
        websiteLink: normalizedWebsite || null,
        companySize: normalizedCompanySize || null,
      });

      if (!vendorUpdated) {
        throw new Error(t("ownership.vendorUpdateFailed"));
      }

      const message = formData.message.trim();
      const tierNote = `${t("ownership.requestedTierLabel")}: ${selectedTierLabel}`;
      const finalMessage = message ? `${message}\n\n${tierNote}` : tierNote;

      await submitOwnershipRequest({
        claimedVendorId,
        message: finalMessage || null,
      });

      updateUser({
        fullName: formData.fullName.trim(),
        phone: formData.phone,
        company: formData.companyName.trim(),
        website: formData.website.trim(),
      });

      toast({
        title: t("ownership.requestSuccessTitle"),
        description: t("ownership.requestSuccessDesc"),
      });
    } catch (err) {
      console.error("[UnclaimedVendorSection] Failed to submit ownership request:", err);
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : t("ownership.requestFailed");
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      id="ownership-request"
    >
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-heading font-bold text-foreground">{t("ownership.title")}</h2>
        <Badge variant="secondary" className="text-xs">
          {t("ownership.unclaimedBadge")}
        </Badge>
      </div>
      
      {!isAuthenticated ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-4">
            {t("ownership.promptTitle")}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed mb-3 max-w-md mx-auto">
            {t("ownership.promptDesc")}
          </p>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {t("ownership.loginRequired")}
          </p>

          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={openAuthModal}
          >
            {t("ownership.loginCta")}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card>
              <CardHeader>
                <CardTitle>{t("ownership.formTitle")}</CardTitle>
                <CardDescription>{t("ownership.formDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownership-full-name">{t("auth.fullName")}</Label>
                    <Input
                      id="ownership-full-name"
                      value={formData.fullName}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, fullName: event.target.value }))
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownership-email">{t("auth.email")}</Label>
                    <Input
                      id="ownership-email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownership-phone">{t("auth.phone")}</Label>
                  <PhoneInput
                    id="ownership-phone"
                    value={formData.phone}
                    onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownership-company">{t("ownership.companyName")}</Label>
                    <Input
                      id="ownership-company"
                      value={formData.companyName}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, companyName: event.target.value }))
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownership-size">{t("ownership.companySize")}</Label>
                    <Input
                      id="ownership-size"
                      placeholder="1-10"
                      value={formData.companySize}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, companySize: event.target.value }))
                      }
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">{t("ownership.companySizeHint")}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownership-website">{t("ownership.website")}</Label>
                  <Input
                    id="ownership-website"
                    type="url"
                    placeholder="https://"
                    value={formData.website}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, website: event.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownership-message">{t("ownership.messageLabel")}</Label>
                  <Textarea
                    id="ownership-message"
                    placeholder={t("ownership.messagePlaceholder")}
                    rows={4}
                    value={formData.message}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, message: event.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("ownership.previewTitle")}</CardTitle>
                <CardDescription>{t("ownership.previewDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="relative aspect-[4/3] bg-muted/40 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-background border border-border text-lg font-semibold text-foreground">
                      {previewName.charAt(0)}
                    </div>
                    {selectedTier !== "freemium" && (
                      <div className="absolute top-2.5 left-2.5">
                        <ListingTierBadge tier={selectedTier} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-foreground">{previewName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {t("ownership.previewStatus")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{previewWebsite}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("ownership.previewTierLabel")}: {selectedTierLabel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("ownership.tierTitle")}</CardTitle>
              <CardDescription>{t("ownership.tierSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {tierOptions.map((tier) => {
                const isSelected = tier.id === selectedTier;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={`flex h-full flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {tier.subtitle}
                        </p>
                        <h4 className="text-lg font-semibold text-foreground">{tier.name}</h4>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="mt-4 text-2xl font-semibold text-foreground">{tier.price}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">{t("ownership.paymentTitle")}</CardTitle>
                <CardDescription>{paymentDescription}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input disabled placeholder="•••• •••• •••• ••••" className="rounded-xl" />
                <Input disabled placeholder="MM/YY" className="rounded-xl" />
              </div>
              <Input disabled placeholder="CVC" className="rounded-xl" />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span>{t("ownership.profileUpdateNote")}</span>
            </div>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("ownership.submitting") : t("ownership.submit")}
            </Button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default UnclaimedVendorSection;
