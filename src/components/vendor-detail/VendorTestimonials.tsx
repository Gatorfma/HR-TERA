import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { VendorTestimonial } from "@/data/vendors";

interface VendorTestimonialsProps {
  testimonials: VendorTestimonial[];
}

const VendorTestimonials = ({ testimonials }: VendorTestimonialsProps) => {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">
        What Clients Say
      </h2>
      <div className="space-y-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="relative">
            <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-2" />
            <div className="pl-6">
              <p className="text-muted-foreground italic mb-4">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.clientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {testimonial.clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default VendorTestimonials;
