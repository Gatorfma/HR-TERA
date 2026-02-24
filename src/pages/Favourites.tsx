import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { useFavouritesContext } from "@/contexts/FavouritesContext";
import { supabase } from "@/api/supabaseClient";
import { Tier } from "@/lib/types";

interface FavouriteProduct {
  product_id: string;
  product_name: string;
  logo: string;
  main_category: string;
  short_desc: string;
  subscription: Tier;
  is_verified: boolean;
}

const Favourites = () => {
  const { user, isAuthenticated } = useAuth();
  const { count } = useFavouritesContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState<FavouriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchFavourites = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_favourite_products");
        if (error) throw error;
        setProducts(data ?? []);
      } catch (err) {
        console.error("[Favourites] Error fetching favourite products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavourites();
  }, [user]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h1 className="font-heading font-bold text-2xl text-foreground">Favorilerim</h1>
            {!isLoading && products.length > 0 && (
              <span className="text-sm text-muted-foreground">({products.length})</span>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Yükleniyor...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Henüz favori ürün eklemediniz.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ürün kartlarındaki kalp simgesine tıklayarak favorilerinize ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <ProductCard
                  key={product.product_id}
                  product_id={product.product_id}
                  image={product.logo}
                  category={product.main_category}
                  name={product.product_name}
                  description={product.short_desc}
                  tier={product.subscription}
                  isVerified={product.is_verified}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favourites;
