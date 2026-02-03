import { UseFormReturn } from "react-hook-form";
import { Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ProductFormSection, SectionHeader, SectionContent } from "./ProductFormLayout";
import { ProductFormValues, AVAILABLE_FEATURES, TIER_CONSTRAINTS } from "@/lib/schemas/product.schema";
import { Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FeaturesSectionProps {
  form: UseFormReturn<ProductFormValues>;
  tier: Tier;
  addFeature: (feature: string) => void;
  removeFeature: (feature: string) => void;
  canAddFeature: boolean;
}

export function FeaturesSection({
  form,
  tier,
  addFeature,
  removeFeature,
  canAddFeature,
}: FeaturesSectionProps) {
  const selectedFeatures = form.watch("features");
  const constraints = TIER_CONSTRAINTS[tier];

  const handleToggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      removeFeature(feature);
    } else if (canAddFeature) {
      addFeature(feature);
    }
  };

  return (
    <ProductFormSection id="features">
      <SectionHeader
        icon={<Sparkles className="h-5 w-5" />}
        title="Ozellikler"
        description="Urun ozelliklerini secin"
        badge={
          <Badge variant="outline" className="text-xs">
            {selectedFeatures.length}/{constraints.maxFeatures}
          </Badge>
        }
      />
      <SectionContent>
        <FormField
          control={form.control}
          name="features"
          render={() => (
            <FormItem>
              <FormLabel>Ozellikler Secin</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2 p-3 border border-input rounded-lg bg-background min-h-[100px]">
                  {AVAILABLE_FEATURES.map((feature) => {
                    const isSelected = selectedFeatures.includes(feature);
                    const isDisabled = !isSelected && !canAddFeature;

                    return (
                      <Badge
                        key={feature}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-primary/20",
                          isSelected && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => !isDisabled && handleToggleFeature(feature)}
                      >
                        {feature}
                        {isSelected && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selected features summary */}
        {selectedFeatures.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedFeatures.length} özellik seçildi
            {!canAddFeature && (
              <span className="text-amber-600 ml-2">
                (Maksimum sayıya ulaşıldı)
              </span>
            )}
          </div>
        )}
      </SectionContent>
    </ProductFormSection>
  );
}

export default FeaturesSection;
