import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgeCheck, Heart } from "lucide-react";
import { Tier } from "@/lib/types";
import ListingTierBadge from "./ListingTierBadge";
import LogoImage from "./ui/logo-image";
import { useFavouritesContext } from "@/contexts/FavouritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  image: string;
  category: string;
  name: string;
  description: string;
  index?: number;
  product_id?: string;
  slug?: string; // Alias for backwards compatibility
  tier?: Tier;
  isVerified?: boolean;
}

const ProductCard = ({
  image,
  category,
  name,
  description,
  index = 0,
  product_id,
  slug,
  tier = "freemium",
  isVerified = false,
}: ProductCardProps) => {
  const productIdentifier = product_id || slug || "";
  const { isFavourited, toggleFavourite } = useFavouritesContext();
  const { user } = useAuth();
  const { toast } = useToast();

  const favourited = product_id ? isFavourited(product_id) : false;

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Giriş yapın",
        description: "Favorilere eklemek için giriş yapmanız gerekiyor.",
      });
      return;
    }
    if (!product_id) return;
    try {
      await toggleFavourite(product_id);
    } catch {
      toast({
        title: "Hata",
        description: "Favori işlemi başarısız oldu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <Link to={`/products/${productIdentifier}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group cursor-pointer"
        >
          <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border">
            <div className="relative">
              <LogoImage variant="card" src={image} alt={name} hoverZoom fallbackText={name} />
              {tier !== "freemium" && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <ListingTierBadge tier={tier} />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">{category}</span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-1">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Heart button — outside the Link to prevent card navigation on click */}
      <button
        onClick={handleHeartClick}
        className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm border ${
          favourited
            ? "bg-red-50 border-red-200 hover:bg-red-100"
            : "bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        }`}
        title={favourited ? "Favorilerden kaldır" : "Favorilere ekle"}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            favourited ? "text-red-500 fill-red-500" : "text-muted-foreground"
          }`}
        />
      </button>
    </div>
  );
};

export default ProductCard;
