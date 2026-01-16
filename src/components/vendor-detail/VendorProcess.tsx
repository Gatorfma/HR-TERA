import { motion } from "framer-motion";

interface ProcessStep {
  title: string;
  description: string;
}

interface VendorProcessProps {
  steps: ProcessStep[];
}

const VendorProcess = ({ steps }: VendorProcessProps) => {
  if (!steps || steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">
        Our Process
      </h2>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Step number */}
              <div className="w-8 h-8 rounded-full bg-primary text-[#111827] flex items-center justify-center font-bold text-sm flex-shrink-0 z-10">
                {index + 1}
              </div>
              <div className="pt-1">
                <h3 className="font-heading font-bold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default VendorProcess;
