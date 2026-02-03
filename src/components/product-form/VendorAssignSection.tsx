import { useState, useEffect, useCallback } from "react";
import { Building2, Search, X, CheckCircle, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { ProductFormSection, SectionHeader, SectionContent } from "./ProductFormLayout";
import { VendorSearchResult } from "@/lib/admin-types";
import { Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VendorAssignSectionProps {
  selectedVendor: VendorSearchResult | null;
  onSelectVendor: (vendor: VendorSearchResult) => void;
  onClearVendor: () => void;
  searchVendors: (query: string) => Promise<VendorSearchResult[]>;
  originalVendorId?: string;
  error?: string;
}

const getTierBadgeColor = (tier: Tier) => {
  switch (tier) {
    case "premium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "plus":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-green-100 text-green-800 border-green-300";
  }
};

export function VendorAssignSection({
  selectedVendor,
  onSelectVendor,
  onClearVendor,
  searchVendors,
  originalVendorId,
  error,
}: VendorAssignSectionProps) {
  const [searchInput, setSearchInput] = useState("");
  const [vendors, setVendors] = useState<VendorSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  const vendorChanged = selectedVendor?.vendor_id !== originalVendorId;

  // Vendor'ları yükle
  const loadVendors = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchVendors(query);
      setVendors(results);
    } catch (err) {
      console.error("[VendorAssignSection] Search error:", err);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchVendors]);

  // İlk yüklemede tüm vendor'ları getir
  useEffect(() => {
    if (!hasLoadedInitial) {
      setHasLoadedInitial(true);
      loadVendors("");
    }
  }, [hasLoadedInitial, loadVendors]);

  // Input değiştiğinde ara (debounce ile)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, loadVendors]);

  const handleSelectVendor = (vendor: VendorSearchResult) => {
    onSelectVendor(vendor);
    setSearchInput("");
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Seçim yapılabilmesi için gecikme
    setTimeout(() => setShowDropdown(false), 150);
  };

  return (
    <ProductFormSection id="vendor">
      <SectionHeader
        icon={<Building2 className="h-5 w-5" />}
        title="Şirket Atama"
        description="Ürünün bağlı olduğu şirket"
        badge={
          vendorChanged && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
              Değiştirildi
            </Badge>
          )
        }
      />
      <SectionContent>
        {/* Seçili vendor gösterimi */}
        {selectedVendor ? (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {selectedVendor.company_name?.slice(0, 2).toUpperCase() || "V"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {selectedVendor.company_name || "İsimsiz Vendor"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={cn(
                      "text-[10px] capitalize",
                      getTierBadgeColor(selectedVendor.subscription)
                    )}
                  >
                    {selectedVendor.subscription}
                  </Badge>
                  {selectedVendor.is_verified && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                  {selectedVendor.headquarters && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {selectedVendor.headquarters}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {vendorChanged && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearVendor}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground">
            <p className="text-sm">Şirket seçilmedi</p>
          </div>
        )}

        {/* Vendor arama */}
        <div className="space-y-2 relative">
          <Label>Şirket Ara</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Şirket adı ile ara veya tıklayarak listele..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="pl-10"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Vendor listesi / arama sonuçları */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
              {isLoading && vendors.length === 0 ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Yükleniyor...</span>
                </div>
              ) : vendors.length > 0 ? (
                <div className="py-1">
                  {vendors.map((vendor) => (
                    <button
                      key={vendor.vendor_id}
                      type="button"
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectVendor(vendor);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {vendor.company_name?.slice(0, 2).toUpperCase() || "V"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            {vendor.company_name || "İsimsiz"}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className={cn(
                                "text-[10px] capitalize",
                                getTierBadgeColor(vendor.subscription)
                              )}
                            >
                              {vendor.subscription}
                            </Badge>
                            {vendor.is_verified && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          {vendor.headquarters && (
                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {vendor.headquarters}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-primary font-medium shrink-0">Seç</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {searchInput.length > 0 ? "Şirket bulunamadı" : "Henüz şirket yok"}
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </SectionContent>
    </ProductFormSection>
  );
}

export default VendorAssignSection;
