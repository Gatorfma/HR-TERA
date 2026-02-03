import { UseFormReturn } from "react-hook-form";
import { Image, Lock, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ProductFormSection, SectionHeader, SectionContent, FieldGrid } from "./ProductFormLayout";
import { ProductFormValues } from "@/lib/schemas/product.schema";
import { Tier } from "@/lib/types";
import ImageUpload from "@/components/admin/ImageUpload";

interface MediaSectionProps {
  form: UseFormReturn<ProductFormValues>;
  tier: Tier;
  canUseVideo: boolean;
  canAddGallery: boolean;
  addGalleryImage: (url: string) => void;
  removeGalleryImage: (index: number) => void;
  onLogoUpload?: (file: File) => void;
  onGalleryUpload?: (files: FileList) => void;
}

export function MediaSection({
  form,
  tier,
  canUseVideo,
  canAddGallery,
}: MediaSectionProps) {
  const gallery = form.watch("gallery");

  return (
    <ProductFormSection id="media">
      <SectionHeader
        icon={<Image className="h-5 w-5" />}
        title="Medya"
        description="Logo, video ve galeri gorselleri"
      />
      <SectionContent>
        <FieldGrid>
          {/* Logo Upload */}
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Logo <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(value) => form.setValue("logo", value, { shouldDirty: true, shouldValidate: true })}
                    previewSize="md"
                    maxSizeMB={2}
                    showUrlInput={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Video URL */}
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video URL
                  {!canUseVideo && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Plus+
                    </Badge>
                  )}
                </FormLabel>
                {canUseVideo ? (
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://youtube.com/..."
                      {...field}
                    />
                  </FormControl>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span>Video ozelligini kullanmak icin paketinizi yukseltin.</span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </FieldGrid>

        {/* Gallery */}
        <FormField
          control={form.control}
          name="gallery"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Galeri
                {!canAddGallery && tier === "freemium" && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Plus+
                  </Badge>
                )}
              </FormLabel>
              {canAddGallery || gallery.length > 0 ? (
                <FormControl>
                  <ImageUpload
                    multiple
                    value={field.value}
                    onChange={(value) => form.setValue("gallery", value, { shouldDirty: true, shouldValidate: true })}
                    maxImages={10}
                    maxSizeMB={2}
                    showUrlInput={true}
                  />
                </FormControl>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span>Galeri ozelligini kullanmak icin paketinizi yukseltin.</span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </SectionContent>
    </ProductFormSection>
  );
}

export default MediaSection;
