import { useLanguage } from "@/contexts/LanguageContext";

export type CompareFeature =
  | "description"
  | "pricing"
  | "languages"
  | "rating"
  | "companySize"
  | "categories"
  | "headquarters"
  | "foundedYear";

interface FeatureSelectorProps {
  selectedFeatures: CompareFeature[];
  onToggle: (feature: CompareFeature) => void;
}

const ALL_FEATURES: CompareFeature[] = [
  "description",
  "pricing",
  "languages",
  "rating",
  "companySize",
  "categories",
  "headquarters",
  "foundedYear",
];

const FeatureSelector = ({ selectedFeatures, onToggle }: FeatureSelectorProps) => {
  const { t } = useLanguage();

  const featureLabels: Record<CompareFeature, string> = {
    description: t("compare.features.description"),
    pricing: t("compare.features.pricing"),
    languages: t("compare.features.languages"),
    rating: t("compare.features.rating"),
    companySize: t("compare.features.companySize"),
    categories: t("compare.features.categories"),
    headquarters: t("compare.features.headquarters"),
    foundedYear: t("compare.features.foundedYear"),
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        {t("compare.selectFeatures")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {ALL_FEATURES.map((feature) => {
          const isSelected = selectedFeatures.includes(feature);
          return (
            <button
              key={feature}
              onClick={() => onToggle(feature)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-foreground border border-border hover:border-primary/50"
              }`}
            >
              {featureLabels[feature]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { ALL_FEATURES };
export default FeatureSelector;
