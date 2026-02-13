import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductSlot from "@/components/compare/ProductSlot";
import ProductSearch from "@/components/compare/ProductSearch";
import CompareTable from "@/components/compare/CompareTable";
import FeatureSelector, { CompareFeature } from "@/components/compare/FeatureSelector";
import { getProductDetails } from "@/api/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";

const MAX_PRODUCTS = 5;
const DEFAULT_FEATURES: CompareFeature[] = ["description", "pricing", "languages", "rating", "categories"];

interface ProductDetails {
  product_id: string;
  product_name: string;
  logo: string;
  short_desc: string;
  main_category: string;
  categories: string[];
  pricing: string;
  languages: string[];
  rating: number;
  company_name: string;
  company_size: string;
  headquarters: string;
  founded_at: string;
  subscription: string;
}

const Compare = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<CompareFeature[]>(DEFAULT_FEATURES);

  // Load products from URL params on mount
  useEffect(() => {
    const productsParam = searchParams.get("products");
    if (productsParam) {
      const ids = productsParam.split(",").filter(Boolean).slice(0, MAX_PRODUCTS);
      if (ids.length > 0) {
        loadProducts(ids);
      }
    }
  }, []);

  const loadProducts = async (ids: string[]) => {
    setLoading(true);
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            return await getProductDetails(id);
          } catch {
            return null;
          }
        })
      );
      const validProducts = results.filter(Boolean) as ProductDetails[];
      setProducts(validProducts);
    } catch (err) {
      console.error("Error loading compare products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync product IDs to URL
  const updateUrl = useCallback(
    (newProducts: ProductDetails[]) => {
      if (newProducts.length > 0) {
        setSearchParams({ products: newProducts.map((p) => p.product_id).join(",") });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams]
  );

  const handleAddProduct = async (product: {
    product_id: string;
    product_name: string;
    logo: string;
    main_category: string;
    subscription: string;
  }) => {
    if (products.length >= MAX_PRODUCTS) return;
    if (products.some((p) => p.product_id === product.product_id)) return;

    setLoading(true);
    try {
      const details = await getProductDetails(product.product_id);
      if (details) {
        const newProducts = [...products, details as ProductDetails];
        setProducts(newProducts);
        updateUrl(newProducts);
      }
    } catch (err) {
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    const newProducts = products.filter((p) => p.product_id !== productId);
    setProducts(newProducts);
    updateUrl(newProducts);
  };

  const handleToggleFeature = (feature: CompareFeature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  // Compute empty slots to fill up to at least 2 visible
  const slotCount = Math.max(2, Math.min(products.length + 1, MAX_PRODUCTS));

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
              {t("compare.title")}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("compare.subtitle")}
            </p>
          </div>

          {/* Product Slots */}
          <div className="mb-8">
            {loading && products.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${slotCount}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: slotCount }).map((_, index) => {
                  const product = products[index] || null;
                  return (
                    <ProductSlot
                      key={product?.product_id || `empty-${index}`}
                      product={product}
                      onAdd={() => setSearchOpen(true)}
                      onRemove={() => product && handleRemoveProduct(product.product_id)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Feature Selector */}
          {products.length >= 2 && (
            <div className="bg-card rounded-xl p-5 shadow-card border border-border mb-8">
              <FeatureSelector
                selectedFeatures={selectedFeatures}
                onToggle={handleToggleFeature}
              />
            </div>
          )}

          {/* Comparison Table */}
          {products.length >= 2 && selectedFeatures.length > 0 ? (
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <CompareTable products={products} features={selectedFeatures} />
            </div>
          ) : products.length < 2 ? (
            <div className="text-center py-16">
              <ArrowLeftRight className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{t("compare.noProducts")}</p>
            </div>
          ) : null}
        </div>
      </main>

      {/* Search Modal */}
      <ProductSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleAddProduct}
        excludeIds={products.map((p) => p.product_id)}
        compareProductIds={products.map((p) => p.product_id)}
      />

      <Footer />
    </div>
  );
};

export default Compare;
