import { UseFormReturn } from "react-hook-form";
import { Settings, Calendar, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ProductFormSection, SectionHeader, SectionContent, FieldGrid } from "./ProductFormLayout";
import { ProductFormValues } from "@/lib/schemas/product.schema";
import { ListingStatus } from "@/lib/types";

interface StatusSectionProps {
  form: UseFormReturn<ProductFormValues>;
  createdAt?: string | null;
  updatedAt?: string | null;
  rating?: number | null;
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("tr-TR");
};

const getStatusLabel = (status: ListingStatus) => {
  switch (status) {
    case "approved":
      return "Onaylandı";
    case "pending":
      return "Beklemede";
    case "rejected":
      return "Reddedildi";
    default:
      return status;
  }
};

export function StatusSection({
  form,
  createdAt,
  updatedAt,
  rating,
}: StatusSectionProps) {
  return (
    <ProductFormSection id="status">
      <SectionHeader
        icon={<Settings className="h-5 w-5" />}
        title="Durum Bilgileri"
        description="Urun yayin durumunu ayarlayin"
      />
      <SectionContent>
        <FieldGrid>
          {/* Listing Status */}
          <FormField
            control={form.control}
            name="listingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yayın Durumu</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rating (read-only) */}
          {rating !== undefined && (
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rating
              </FormLabel>
              <Input
                value={rating?.toFixed(1) || "N/A"}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          {/* Created At (read-only) */}
          {createdAt !== undefined && (
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Oluşturulma Tarihi
              </FormLabel>
              <Input
                value={formatDate(createdAt)}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          {/* Updated At (read-only) */}
          {updatedAt !== undefined && (
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Son Güncelleme
              </FormLabel>
              <Input
                value={formatDate(updatedAt)}
                disabled
                className="bg-muted"
              />
            </div>
          )}
        </FieldGrid>
      </SectionContent>
    </ProductFormSection>
  );
}

export default StatusSection;
