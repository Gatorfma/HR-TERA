import { motion } from "framer-motion";
import { CheckCircle2, Rocket } from "lucide-react";

interface ImplementationSectionProps {
  steps: string[];
}

const ImplementationSection = ({ steps }: ImplementationSectionProps) => {
  if (!steps || steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-primary" />
        Implementation & Onboarding
      </h2>
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-foreground">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ImplementationSection;
