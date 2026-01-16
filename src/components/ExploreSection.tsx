import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExploreSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Products Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/10 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
              Products
            </h3>
            <p className="text-muted-foreground mb-6">
              Our Premium products are designed to
              accelerate your HR transformation process while
              offering complete flexibility.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={`https://images.unsplash.com/photo-155143467${i}-e076c223a692?w=200&h=150&fit=crop`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <Button variant="outline" className="rounded-full border-border text-foreground hover:bg-muted">
              Explore all
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          {/* Vendors Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-muted rounded-2xl p-8"
          >
            <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
              Vendors
            </h3>
            <p className="text-muted-foreground mb-6">
              Our exclusive vendors are designed to
              accelerate your HR solutions process while
              offering complete flexibility.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-card">
                  <img
                    src={`https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=150&fit=crop&q=${i * 10}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <Button variant="outline" className="rounded-full border-border text-foreground hover:bg-card">
              Explore all
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;