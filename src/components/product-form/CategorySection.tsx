import { UseFormReturn } from "react-hook-form";
import { Layers, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { ProductFormSection, SectionHeader, SectionContent, FieldGrid } from "./ProductFormLayout";
import { CategoryCombobox, MultiCategoryCombobox } from "./CategoryCombobox";
import { ProductFormValues, TIER_CONSTRAINTS } from "@/lib/schemas/product.schema";
import { Tier } from "@/lib/types";

interface CategorySectionProps {
  form: UseFormReturn<ProductFormValues>;
  categories: string[];
  tier: Tier;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  canAddCategory: boolean;
}

export function CategorySection({
  form,
  categories,
  tier,
  addCategory,
  removeCategory,
  canAddCategory,
}: CategorySectionProps) {
  const selectedCategories = form.watch("categories");
  const mainCategory = form.watch("mainCategory");
  const constraints = TIER_CONSTRAINTS[tier];
  const maxSecondaryCategories = constraints.maxCategories - 1; // -1 for main category

  return (
    <ProductFormSection id="categories">
      <SectionHeader
        icon={<Layers className="h-5 w-5" />}
        title="Kategoriler"
        description="Urun kategorilerini secin"
        badge={
          tier !== "freemium" && (
            <Badge variant="outline" className="text-xs">
              {selectedCategories.length}/{maxSecondaryCategories} ek kategori
            </Badge>
          )
        }
      />
      <SectionContent>
        <FieldGrid columns={tier === "freemium" ? 1 : 2}>
          <FormField
            control={form.control}
            name="mainCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ana Kategori <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <CategoryCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    categories={categories}
                    placeholder="Ana kategori sec..."
                    excludeCategories={selectedCategories}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {tier !== "freemium" && (
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ek Kategoriler ({selectedCategories.length}/{maxSecondaryCategories})
                  </FormLabel>
                  <FormControl>
                    <MultiCategoryCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      categories={categories}
                      maxSelections={maxSecondaryCategories}
                      placeholder="Kategori ekle..."
                      excludeCategories={mainCategory ? [mainCategory] : []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </FieldGrid>

        {/* Selected categories display */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20 transition-colors"
                onClick={() => removeCategory(category)}
              >
                {category}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {tier === "freemium" && (
          <FormDescription className="text-xs">
            Ek kategori eklemek icin paketinizi yukseltin.
          </FormDescription>
        )}
      </SectionContent>
    </ProductFormSection>
  );
}

export default CategorySection;
