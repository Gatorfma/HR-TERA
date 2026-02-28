import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface FavouritesContextType {
  favouriteIds: Set<string>;
  isFavourited: (productId: string) => boolean;
  toggleFavourite: (productId: string) => Promise<void>;
  count: number;
  isLoading: boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadFavourites = useCallback(async () => {
    if (!user) {
      setFavouriteIds(new Set());
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("favourites")
        .select("product_id")
        .eq("user_id", user.id);
      if (error) throw error;
      setFavouriteIds(new Set(data?.map((f: { product_id: string }) => f.product_id) ?? []));
    } catch (err) {
      console.error("[FavouritesContext] Error loading favourites:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavourites();
  }, [loadFavourites]);

  const isFavourited = useCallback(
    (productId: string) => favouriteIds.has(productId),
    [favouriteIds]
  );

  const toggleFavourite = useCallback(async (productId: string) => {
    if (!user) return;
    const wasFavourited = favouriteIds.has(productId);

    // Optimistic update
    setFavouriteIds(prev => {
      const next = new Set(prev);
      if (wasFavourited) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      if (wasFavourited) {
        const { error } = await supabase
          .from("favourites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favourites")
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
      }
    } catch (err) {
      console.error("[FavouritesContext] Error toggling favourite:", err);
      // Revert optimistic update
      setFavouriteIds(prev => {
        const next = new Set(prev);
        if (wasFavourited) next.add(productId);
        else next.delete(productId);
        return next;
      });
      throw err;
    }
  }, [user, favouriteIds]);

  return (
    <FavouritesContext.Provider value={{
      favouriteIds,
      isFavourited,
      toggleFavourite,
      count: favouriteIds.size,
      isLoading,
    }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavouritesContext() {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error("useFavouritesContext must be used within FavouritesProvider");
  return context;
}
