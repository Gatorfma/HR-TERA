import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Sparkles, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [customFeature, setCustomFeature] = useState("");

  const handleToggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      removeFeature(feature);
    } else if (canAddFeature) {
      addFeature(feature);
    }
  };

  const handleAddCustomFeature = () => {
    const trimmed = customFeature.trim();
    if (!trimmed) return;
    if (selectedFeatures.includes(trimmed)) {
      setCustomFeature("");
      return;
    }
    if (!canAddFeature) return;
    addFeature(trimmed);
    setCustomFeature("");
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomFeature();
    }
  };

  // Separate selected features into predefined and custom
  const customSelected = selectedFeatures.filter(
    (f) => !(AVAILABLE_FEATURES as readonly string[]).includes(f)
  );

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
                  {/* Show custom features as removable badges */}
                  {customSelected.map((feature) => (
                    <Badge
                      key={feature}
                      variant="default"
                      className="cursor-pointer transition-all bg-violet-600 text-white hover:bg-violet-700"
                      onClick={() => removeFeature(feature)}
                    >
                      {feature}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Custom feature input */}
        <div className="flex gap-2">
          <Input
            placeholder="Yeni özellik ekle..."
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            disabled={!canAddFeature}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomFeature}
            disabled={!canAddFeature || !customFeature.trim()}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ekle
          </Button>
        </div>

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
