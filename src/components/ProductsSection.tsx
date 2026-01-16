import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tier, DashboardProduct } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductsSectionProps {
  products?: DashboardProduct[];
}

const ProductsSection = ({ products = [] }: ProductsSectionProps) => {
  const { t } = useLanguage();
  
  // Map API products to ProductCard format
  const mappedProducts = products
    .map((product) => ({
      product_id: product.product_id,
      image: product.logo,
      category: product.main_category,
      name: product.product_name,
      description: product.short_desc,
      tier: product.subscription.toLowerCase() as Tier,
      isVerified: product.is_verified,
    }));

  if (mappedProducts.length === 0) return null;

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t("products.title")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("products.subtitle")}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full border-border text-foreground hover:bg-muted" 
            asChild
          >
            <Link to="/products">
              {t("products.browseAll")}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mappedProducts.map((product, index) => (
            <ProductCard
              key={product.product_id}
              product_id={product.product_id}
              image={product.image}
              category={product.category}
              name={product.name}
              description={product.description}
              index={index}
              tier={product.tier}
              isVerified={product.isVerified}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
