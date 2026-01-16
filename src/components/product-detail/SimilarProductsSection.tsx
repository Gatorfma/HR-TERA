import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Tier } from "@/lib/types";

// Flexible interface to support both API and static products
interface SimilarProduct {
  id: string;
  slug: string;
  image: string;
  category: string;
  name: string;
  price: string;
  description: string;
  vendorTier: Tier;
}

interface SimilarProductsSectionProps {
  products: SimilarProduct[];
}

const SimilarProductsSection = ({ products }: SimilarProductsSectionProps) => {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8">
          Benzer Ürünler
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product_id={product.slug}
              image={product.image}
              category={product.category}
              name={product.name}
              price={product.price}
              description={product.description}
              tier={product.vendorTier}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SimilarProductsSection;
