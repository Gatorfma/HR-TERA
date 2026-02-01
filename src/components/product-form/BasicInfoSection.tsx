import { UseFormReturn } from "react-hook-form";
import { Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { ProductFormSection, SectionHeader, SectionContent, FieldGrid, FullWidthField } from "./ProductFormLayout";
import { ProductFormValues } from "@/lib/schemas/product.schema";

interface BasicInfoSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const shortDesc = form.watch("shortDesc");
  const longDesc = form.watch("longDesc");

  return (
    <ProductFormSection id="basic-info">
      <SectionHeader
        icon={<Tag className="h-5 w-5" />}
        title="Temel Bilgiler"
        description="Ürün adı ve açıklamaları"
      />
      <SectionContent>
        <FieldGrid>
          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ürün Adı <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Orn: TalentHub" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="websiteLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web Sitesi</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FieldGrid>

        <FullWidthField>
          <FormField
            control={form.control}
            name="shortDesc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Kısa Açıklama <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ürününüzü kısaca tanımlayın (10-200 karakter)"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {shortDesc?.length || 0}/200 karakter
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FullWidthField>

        <FullWidthField>
          <FormField
            control={form.control}
            name="longDesc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detaylı Açıklama</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ürününüzü detaylı olarak tanımlayın"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {longDesc?.length || 0}/5000 karakter
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FullWidthField>
      </SectionContent>
    </ProductFormSection>
  );
}

export default BasicInfoSection;
