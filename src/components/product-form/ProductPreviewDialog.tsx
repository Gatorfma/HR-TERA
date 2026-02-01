import { Eye, X, ExternalLink, Globe, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ProductFormValues } from "@/lib/schemas/product.schema";
import { Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: ProductFormValues;
  tier?: Tier;
  companyName?: string;
}

export function ProductPreviewDialog({
  open,
  onOpenChange,
  values,
  tier = "freemium",
  companyName,
}: ProductPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Ürün Önizlemesi
          </DialogTitle>
          <DialogDescription>
            Ürününüzün son kullanıcılara nasıl görüneceğini inceleyin
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="card" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card">Kart Gorunumu</TabsTrigger>
            <TabsTrigger value="detail">Detay Sayfasi</TabsTrigger>
          </TabsList>

          {/* Card View */}
          <TabsContent value="card" className="mt-4">
            <div className="flex justify-center">
              <ProductCard values={values} tier={tier} />
            </div>
          </TabsContent>

          {/* Detail View */}
          <TabsContent value="detail" className="mt-4">
            <ProductDetail
              values={values}
              tier={tier}
              companyName={companyName}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Product card preview
function ProductCard({
  values,
  tier,
}: {
  values: ProductFormValues;
  tier: Tier;
}) {
  return (
    <Card className="w-[320px] overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        {values.logo ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <img
              src={values.logo}
              alt={values.productName}
              className="w-20 h-20 rounded-xl object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-sm">Logo önizlemesi</span>
          </div>
        )}
        {tier !== "freemium" && (
          <div className="absolute top-2.5 left-2.5">
            <Badge
              className={cn(
                "text-xs",
                tier === "premium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              )}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            {values.mainCategory || "Kategori"}
          </span>
          <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {values.pricing || "Free"}
          </span>
        </div>
        <h3 className="font-bold text-foreground mb-1">
          {values.productName || "Ürün Adı"}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {values.shortDesc || "Ürün açıklaması burada görünecek..."}
        </p>
      </CardContent>
    </Card>
  );
}

// Product detail preview
function ProductDetail({
  values,
  tier,
  companyName,
}: {
  values: ProductFormValues;
  tier: Tier;
  companyName?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {values.logo ? (
          <img
            src={values.logo}
            alt={values.productName}
            className="w-20 h-20 rounded-xl object-cover border border-border"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            Logo
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">
              {values.productName || "Ürün Adı"}
            </h2>
            {tier !== "freemium" && (
              <Badge
                className={cn(
                  tier === "premium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Badge>
            )}
          </div>
          {companyName && (
            <p className="text-muted-foreground">{companyName}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">{values.mainCategory || "Kategori"}</Badge>
            <span className="text-sm font-medium text-primary">
              {values.pricing || "Free"}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold mb-2">Hakkında</h3>
        <p className="text-muted-foreground">
          {values.shortDesc || "Kısa açıklama"}
        </p>
        {values.longDesc && (
          <p className="text-muted-foreground mt-2">{values.longDesc}</p>
        )}
      </div>

      {/* Categories */}
      {values.categories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Kategoriler</h3>
          <div className="flex flex-wrap gap-2">
            {[values.mainCategory, ...values.categories].filter(Boolean).map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {values.features.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Özellikler</h3>
          <div className="flex flex-wrap gap-2">
            {values.features.map((feature) => (
              <Badge key={feature} variant="outline">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-4">
        {values.websiteLink && (
          <Button variant="outline" size="sm" asChild>
            <a href={values.websiteLink} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-2" />
              Web Sitesi
            </a>
          </Button>
        )}
        {values.demoLink && tier === "premium" && (
          <Button variant="outline" size="sm" asChild>
            <a href={values.demoLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Demo
            </a>
          </Button>
        )}
      </div>

      {/* Gallery */}
      {values.gallery.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Galeri</h3>
          <div className="grid grid-cols-4 gap-2">
            {values.gallery.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Gallery ${index + 1}`}
                className="aspect-video object-cover rounded-lg border border-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {values.languages.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Desteklenen Diller</h3>
          <div className="flex flex-wrap gap-2">
            {values.languages.map((lang) => (
              <Badge key={lang} variant="secondary">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact preview card for sidebar
export function ProductPreviewCard({
  values,
  tier = "freemium",
  onClick,
}: {
  values: ProductFormValues;
  tier?: Tier;
  onClick?: () => void;
}) {
  return (
    <Card
      className={cn("overflow-hidden", onClick && "cursor-pointer hover:shadow-md transition-shadow")}
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        {values.logo ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <img
              src={values.logo}
              alt={values.productName}
              className="w-16 h-16 rounded-xl object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-xs">Logo</span>
          </div>
        )}
        {tier !== "freemium" && (
          <div className="absolute top-2 left-2">
            <Badge className="text-[10px] px-1.5 py-0">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-muted-foreground truncate">
            {values.mainCategory || "Kategori"}
          </span>
          <span className="text-xs font-semibold text-primary">
            {values.pricing || "Free"}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-foreground truncate">
          {values.productName || "Ürün Adı"}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {values.shortDesc || "Açıklama..."}
        </p>
      </CardContent>
      {onClick && (
        <div className="px-3 pb-3">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Tam Onizle
          </Button>
        </div>
      )}
    </Card>
  );
}

export default ProductPreviewDialog;
