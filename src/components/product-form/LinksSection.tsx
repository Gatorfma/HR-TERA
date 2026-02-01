import { UseFormReturn } from "react-hook-form";
import { Link as LinkIcon, ExternalLink, Lock, Globe, DollarSign, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { ProductFormValues, AVAILABLE_LANGUAGES } from "@/lib/schemas/product.schema";
import { Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LinksSectionProps {
  form: UseFormReturn<ProductFormValues>;
  tier: Tier;
  canUseDemo: boolean;
  addLanguage: (language: string) => void;
  removeLanguage: (language: string) => void;
}

export function LinksSection({
  form,
  tier,
  canUseDemo,
  addLanguage,
  removeLanguage,
}: LinksSectionProps) {
  const languages = form.watch("languages");

  const handleToggleLanguage = (language: string) => {
    if (languages.includes(language)) {
      removeLanguage(language);
    } else {
      addLanguage(language);
    }
  };

  return (
    <ProductFormSection id="links">
      <SectionHeader
        icon={<LinkIcon className="h-5 w-5" />}
        title="Baglanti ve Diger Bilgiler"
        description="Demo, fiyatlandirma ve dil bilgileri"
      />
      <SectionContent>
        <FieldGrid>
          {/* Demo Link */}
          <FormField
            control={form.control}
            name="demoLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Demo/Calendly Linki
                  {!canUseDemo && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </FormLabel>
                {canUseDemo ? (
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://calendly.com/..."
                      {...field}
                    />
                  </FormControl>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span>Demo ozelligini kullanmak icin paketinizi yukseltin.</span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pricing */}
          <FormField
            control={form.control}
            name="pricing"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fiyatlandırma
                </FormLabel>
                <FormControl>
                  <Input placeholder="Orn: Free, $99/ay, vb." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Release Date */}
          <FormField
            control={form.control}
            name="releaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Yayınlanma Tarihi
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FieldGrid>

        {/* Languages */}
        <FormField
          control={form.control}
          name="languages"
          render={() => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Desteklenen Diller ({languages.length})
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2 p-3 border border-input rounded-lg bg-background min-h-[60px]">
                  {AVAILABLE_LANGUAGES.map((language) => {
                    const isSelected = languages.includes(language);

                    return (
                      <Badge
                        key={language}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all hover:bg-primary/20",
                          isSelected && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleToggleLanguage(language)}
                      >
                        {language}
                        {isSelected && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
              </FormControl>
              <FormDescription>
                Ürününüzün desteklediği dilleri seçin
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </SectionContent>
    </ProductFormSection>
  );
}

export default LinksSection;
