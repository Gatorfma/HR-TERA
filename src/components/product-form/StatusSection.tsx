import { UseFormReturn } from "react-hook-form";
import { Settings, Calendar, Clock, Star, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  isVerified?: boolean;
  onVerifiedChange?: (value: boolean) => void;
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
  isVerified,
  onVerifiedChange,
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

          {/* Rating (Editable) */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rating (0-5)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Verification Status */}
          {onVerifiedChange && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Onaylanma Durumu
              </Label>
              <Select
                value={isVerified ? "verified" : "unverified"}
                onValueChange={(value) => onVerifiedChange(value === "verified")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Onaylı
                    </span>
                  </SelectItem>
                  <SelectItem value="unverified">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Onaylı Değil
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
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
