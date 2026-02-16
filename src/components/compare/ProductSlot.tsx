import { Plus, X, Bookmark, BookmarkCheck } from "lucide-react";
import ListingTierBadge from "@/components/ListingTierBadge";
import { Tier } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookmarks } from "@/hooks/useBookmarks";

interface ProductData {
  product_id: string;
  product_name: string;
  logo: string;
  main_category: string;
  subscription: string;
}

interface ProductSlotProps {
  product?: ProductData | null;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductSlot = ({ product, onAdd, onRemove }: ProductSlotProps) => {
  const { t } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (!product) {
    return (
      <button
        onClick={onAdd}
        className="flex flex-col items-center justify-center gap-2 bg-card border-2 border-dashed border-border rounded-xl p-6 min-h-[180px] hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {t("compare.addProduct")}
        </span>
      </button>
    );
  }

  return (
    <div className="relative bg-card border border-border rounded-xl p-4 min-h-[180px] shadow-card">
      {/* Bookmark button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleBookmark({
            product_id: product.product_id,
            product_name: product.product_name,
            logo: product.logo,
            main_category: product.main_category,
            subscription: product.subscription,
          });
        }}
        className="absolute top-2 left-2 w-6 h-6 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
        title={isBookmarked(product.product_id) ? t("compare.removeBookmark") : t("compare.bookmark")}
      >
        {isBookmarked(product.product_id) ? (
          <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted hover:bg-destructive/10 flex items-center justify-center transition-colors"
        title={t("compare.removeProduct")}
      >
        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
      </button>

      <div className="flex flex-col items-center text-center gap-3 pt-2">
        {/* Logo */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img
            src={product.logo}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name */}
        <h3 className="font-heading font-bold text-sm text-foreground leading-tight">
          {product.product_name}
        </h3>

        {/* Category & Tier */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{product.main_category}</span>
          {product.subscription !== "freemium" && (
            <ListingTierBadge tier={product.subscription as Tier} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSlot;
