import { Star } from "lucide-react";
import { CompareFeature } from "./FeatureSelector";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductDetails {
  product_id: string;
  product_name: string;
  logo: string;
  short_desc: string;
  main_category: string;
  categories: string[];
  pricing: string;
  languages: string[];
  rating: number;
  company_name: string;
  company_size: string;
  headquarters: string;
  founded_at: string;
  subscription: string;
}

interface CompareTableProps {
  products: ProductDetails[];
  features: CompareFeature[];
}

const CompareTable = ({ products, features }: CompareTableProps) => {
  const { t } = useLanguage();

  if (products.length === 0 || features.length === 0) return null;

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

  const getCellValue = (product: ProductDetails, feature: CompareFeature) => {
    switch (feature) {
      case "description":
        return (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.short_desc || "—"}
          </p>
        );
      case "pricing":
        return (
          <span className="text-sm text-foreground font-medium">
            {product.pricing || "—"}
          </span>
        );
      case "languages":
        return product.languages?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {product.languages.map((lang) => (
              <span
                key={lang}
                className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
              >
                {lang}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "rating":
        return product.rating ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-foreground">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "companySize":
        return (
          <span className="text-sm text-foreground">
            {product.company_size || "—"}
          </span>
        );
      case "categories":
        return product.categories?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {[product.main_category, ...(product.categories || [])].filter(Boolean).map((cat, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-primary/10 rounded text-xs text-primary font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {product.main_category || "—"}
          </span>
        );
      case "headquarters":
        return (
          <span className="text-sm text-foreground">
            {product.headquarters || "—"}
          </span>
        );
      case "foundedYear":
        return (
          <span className="text-sm text-foreground">
            {product.founded_at
              ? new Date(product.founded_at).getFullYear()
              : "—"}
          </span>
        );
      default:
        return <span className="text-sm text-muted-foreground">—</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 text-sm font-semibold text-muted-foreground border-b border-border w-[140px] min-w-[140px]">
              &nbsp;
            </th>
            {products.map((product) => (
              <th
                key={product.product_id}
                className="text-center p-3 text-sm font-semibold text-foreground border-b border-border min-w-[180px]"
              >
                {product.product_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature} className="border-b border-border/50 last:border-b-0">
              <td className="p-3 text-sm font-medium text-foreground align-top">
                {featureLabels[feature]}
              </td>
              {products.map((product) => (
                <td
                  key={product.product_id}
                  className="p-3 align-top"
                >
                  {getCellValue(product, feature)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompareTable;
