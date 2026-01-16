import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingImages = [
  { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=150&fit=crop", position: "top-4 left-4", delay: 0 },
  { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&h=150&fit=crop", position: "top-1/4 left-16", delay: 0.2 },
  { src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=150&fit=crop", position: "bottom-1/4 left-8", delay: 0.4 },
  { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=150&fit=crop", position: "bottom-8 left-20", delay: 0.6 },
  { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=150&fit=crop", position: "top-8 right-8", delay: 0.1 },
  { src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=150&fit=crop", position: "top-1/3 right-16", delay: 0.3 },
  { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=150&fit=crop", position: "bottom-1/3 right-4", delay: 0.5 },
  { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=150&fit=crop", position: "bottom-12 right-24", delay: 0.7 },
];

const MembershipCTA = () => {
  return (
    <section className="py-20 bg-muted relative overflow-hidden">
      {/* Floating Images */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none">
        {floatingImages.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: img.delay }}
            className={`absolute ${img.position} w-36 h-24`}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: img.delay }}
              className="rounded-xl overflow-hidden shadow-card-hover"
            >
              <img src={img.src} alt="" className="w-full h-full object-cover" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Get Membership with
            <br />
            unlimited products
          </h2>
          <p className="text-muted-foreground mb-8">
            Unlock the full potential of your HR with a membership
            that offers unlimited access to our entire library.
          </p>
          <Button className="rounded-full bg-card text-foreground hover:bg-card/90 border border-border px-8">
            Get All Access Now
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MembershipCTA;