import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Building2, Globe, Linkedin, Instagram, MapPin, Calendar, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { getVendorDetails, submitOwnershipRequest } from "@/api/supabaseApi";

interface UnclaimedVendorSectionProps {
  claimedVendorId?: string | null;
  onSuccess?: () => void;
}

interface VendorData {
  company_name: string | null;
  company_motto: string | null;
  website_link: string | null;
  linkedin_link: string | null;
  instagram_link: string | null;
  headquarters: string | null;
  founded_at: string | null;
  company_size: string | null;
  logo: string | null;
}

const UnclaimedVendorSection = ({ claimedVendorId, onSuccess }: UnclaimedVendorSectionProps) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(false);

  useEffect(() => {
    if (!user?.vendorId) return;
    setLoadingVendor(true);
    getVendorDetails(user.vendorId)
      .then((data) => {
        if (data) setVendorData(data);
      })
      .catch((err) => console.error("Error fetching vendor data:", err))
      .finally(() => setLoadingVendor(false));
  }, [user?.vendorId]);

  const openAuthModal = () => {
    toast({
      title: t("common.error"),
      description: t("ownership.loginRequired"),
      variant: "destructive",
    });
    window.dispatchEvent(new CustomEvent("open-auth-modal"));
  };

  const isVendorProfileIncomplete =
    !vendorData?.company_name ||
    !vendorData?.website_link ||
    !vendorData?.headquarters ||
    !vendorData?.company_size;

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

    if (isVendorProfileIncomplete) {
      toast({
        title: t("common.error"),
        description: t("ownership.vendorProfileRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitOwnershipRequest({
        claimedVendorId,
        message: message.trim() || null,
      });

      toast({
        title: t("ownership.requestSuccessTitle"),
        description: t("ownership.requestSuccessDesc"),
      });
      onSuccess?.();
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

  const ReadOnlyField = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) => (
    <div className="flex items-center gap-2.5 py-1.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={`text-xs truncate ${value ? "text-foreground" : "text-muted-foreground italic"}`}>
        {value || t("ownership.notFilled")}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      id="ownership-request"
    >
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-heading font-bold text-foreground">{t("ownership.title")}</h2>
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
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Hint banner */}
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 px-3 py-2.5">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {t("ownership.vendorProfileHint")}
            </p>
          </div>

          {/* Vendor profile read-only */}
          <div>
            <p className="text-sm font-medium text-foreground mb-1">{t("ownership.formTitle")}</p>
            <p className="text-xs text-muted-foreground mb-2">{t("ownership.formDescReadOnly")}</p>
            {loadingVendor ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-1 divide-y divide-border">
                {vendorData?.logo && (
                  <div className="flex items-center gap-2 py-1.5">
                    <img
                      src={vendorData.logo}
                      alt={vendorData.company_name || ""}
                      className="w-8 h-8 rounded-md object-cover border border-border"
                    />
                  </div>
                )}
                <ReadOnlyField icon={Building2} label={t("settings.vendor.companyName")} value={vendorData?.company_name} />
                <ReadOnlyField icon={Globe} label={t("settings.vendor.website")} value={vendorData?.website_link} />
                <ReadOnlyField icon={MapPin} label={t("settings.vendor.headquarters")} value={vendorData?.headquarters} />
                <ReadOnlyField icon={Users} label={t("settings.vendor.companySize")} value={vendorData?.company_size} />
                <ReadOnlyField icon={Linkedin} label={t("settings.vendor.linkedin")} value={vendorData?.linkedin_link} />
                <ReadOnlyField icon={Instagram} label={t("settings.vendor.instagram")} value={vendorData?.instagram_link} />
                <ReadOnlyField icon={Calendar} label={t("settings.vendor.foundedAt")} value={vendorData?.founded_at ? new Date(vendorData.founded_at).toLocaleDateString() : null} />
              </div>
            )}
          </div>

          {/* Message box */}
          <div>
            <Label htmlFor="ownership-message" className="text-sm font-medium">{t("ownership.messageLabel")}</Label>
            <Textarea
              id="ownership-message"
              placeholder={t("ownership.messagePlaceholder")}
              rows={3}
              className="mt-1"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-1">
            <div className="relative group">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting || isVendorProfileIncomplete}
              >
                {isSubmitting ? t("ownership.submitting") : t("ownership.submit")}
              </Button>
              {isVendorProfileIncomplete && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  {t("ownership.vendorProfileRequired")}
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default UnclaimedVendorSection;
