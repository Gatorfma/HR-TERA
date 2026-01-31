import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/api/supabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";

type TierConfigRow = {
  tier: string;
  is_active: boolean | null;
  monthly_price: number | string | null;
  yearly_price: number | string | null;
  currency: string | null;
  highlight_label: string | null;
  tagline: string | null;
  headline: string | null;
  features: unknown;
};

type FeatureJson = {
  title?: string;
  description?: string;
  isIncluded?: boolean;
};

type PricingPlan = {
  tier: string;
  name: string;
  badgeTone: "lime" | "green" | "coral";
  priceMonthly: string;
  priceYearly: string;
  discount?: string;
  description: string;
  features: string[];
  popular?: boolean;
};

const TIER_NAMES: Record<string, string> = {
  freemium: "Freemium",
  plus: "Plus",
  premium: "Premium",
};

const TIER_BADGES: Record<string, PricingPlan["badgeTone"]> = {
  freemium: "lime",
  plus: "green",
  premium: "coral",
};

const FALLBACK_PLANS: PricingPlan[] = [
  {
    tier: "freemium",
    name: "Basic",
    badgeTone: "lime",
    priceMonthly: "Free",
    priceYearly: "Free",
    description: "Free plan for small teams",
    features: [
      "Access to 5 free products",
      "Basic vendor search",
      "3 downloads a day",
      "Community support",
      "Basic analytics",
    ],
  },
  {
    tier: "plus",
    name: "Standard",
    badgeTone: "green",
    priceMonthly: "$29",
    priceYearly: "$290",
    discount: "35% Save",
    description: "Growing Team & Mid-sized",
    features: [
      "Access to 30 products",
      "Advanced vendor matching",
      "10 downloads a day",
      "Priority support",
      "Premium integrations",
    ],
    popular: true,
  },
  {
    tier: "premium",
    name: "Enterprise",
    badgeTone: "coral",
    priceMonthly: "$49",
    priceYearly: "$490",
    discount: "40% Save",
    description: "Large Organizations",
    features: [
      "Full access to all products",
      "Dedicated account manager",
      "Unlimited downloads",
      "24/7 dedicated support",
      "Custom implementations",
    ],
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>(FALLBACK_PLANS);
  const { t, language } = useLanguage();

  const toNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return 0;
    const parsed = typeof value === "string" ? Number(value) : value;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatPrice = (value: number, currency: string) => {
    if (value === 0) return t("pricing.free");
    try {
      return new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${currency} ${value}`;
    }
  };

  const parseFeatures = (raw: unknown) => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const feature = item as FeatureJson;
        if (feature.isIncluded === false) return null;
        const title = (feature.title ?? "").trim();
        const description = (feature.description ?? "").trim();
        return title || description || null;
      })
      .filter((value): value is string => Boolean(value));
  };

  const getSavingsLabel = (monthly: number, yearly: number) => {
    if (monthly <= 0 || yearly <= 0) return undefined;
    const yearlyTotal = monthly * 12;
    if (yearlyTotal <= 0) return undefined;
    const pct = Math.round(100 - (yearly / yearlyTotal) * 100);
    if (pct <= 0) return undefined;
    return language === "tr" ? `%${pct} ${t("pricing.save")}` : `${t("pricing.save")} ${pct}%`;
  };

  useEffect(() => {
    const loadPricing = async () => {
      const { data, error } = await supabase.rpc("get_public_tier_config");
      if (error || !data || data.length === 0) {
        if (error) {
          console.error("[PricingSection] Failed to load tier config:", error);
        }
        return;
      }

      const rows = data as TierConfigRow[];
      const mapped = rows.map((row) => {
        const monthly = toNumber(row.monthly_price);
        const yearly = toNumber(row.yearly_price);
        const currency = row.currency ?? "USD";
        const features = parseFeatures(row.features);
        const highlightLabel = row.highlight_label?.trim() || undefined;
        const discount = highlightLabel ?? getSavingsLabel(monthly, yearly);

        return {
          tier: row.tier,
          name: TIER_NAMES[row.tier] ?? row.tier,
          badgeTone: TIER_BADGES[row.tier] ?? "lime",
          priceMonthly: formatPrice(monthly, currency),
          priceYearly: formatPrice(yearly, currency),
          discount,
          description: row.tagline ?? row.headline ?? "",
          features: features.length > 0 ? features : [t("pricing.comingSoon")],
          popular: row.tier === "plus" || Boolean(highlightLabel),
        } satisfies PricingPlan;
      });

      setPlans(mapped);
    };

    loadPricing();
  }, [language, t]);

  return (
    <section id="pricing" className="py-20 bg-secondary">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-foreground">
            {t("pricing.title")}
          </h2>
          <p className="text-secondary-foreground/80 mt-3 max-w-2xl">
            {t("pricing.subtitle")}
          </p>

          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="bg-muted rounded-full p-1 flex">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  !isYearly ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
                }`}
              >
                {t("pricing.monthly")}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  isYearly ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
                }`}
              >
                {t("pricing.yearly")}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`bg-card rounded-2xl p-8 border ${
                plan.popular ? "border-primary shadow-lg" : "border-border"
              }`}
            >
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                  plan.badgeTone === "lime"
                    ? "bg-primary text-primary-foreground"
                    : plan.badgeTone === "green"
                    ? "bg-emerald-500 text-white"
                    : "bg-orange-400 text-white"
                }`}
              >
                {plan.name}
              </span>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-heading font-bold text-foreground">
                  {isYearly ? plan.priceYearly : plan.priceMonthly}
                </span>
                {plan.discount && (
                  <span className="bg-primary/20 text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {plan.discount}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full ${
                  plan.popular
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    : "bg-transparent border border-border text-foreground hover:bg-muted"
                }`}
              >
                {t("pricing.choosePlan")}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
