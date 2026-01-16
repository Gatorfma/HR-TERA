import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  {
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
    title: "Grow with HR Automation",
    description: "How advanced HR tools can help you scale your team effectively.",
  },
  {
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
    title: "Best Practices for Modern HR",
    description: "Explore how to optimize your HR processes for the future.",
  },
  {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
    title: "Building an HR Tech Stack",
    description: "Tips on creating a unified HR technology ecosystem.",
  },
];

const ResourcesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Learn And Grow with Us
          </h2>
          <Button variant="outline" className="rounded-full border-border text-foreground hover:bg-muted">
            Browse all
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-muted">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                {resource.title}
              </h3>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;