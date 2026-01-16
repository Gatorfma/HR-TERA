import { motion } from "framer-motion";
import { Puzzle } from "lucide-react";

interface IntegrationsSectionProps {
  integrations: string[];
}

const IntegrationsSection = ({ integrations }: IntegrationsSectionProps) => {
  if (!integrations || integrations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
        <Puzzle className="w-5 h-5 text-primary" />
        Integrations
      </h2>
      <div className="flex flex-wrap gap-2">
        {integrations.map((integration, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground border border-border hover:border-primary/50 transition-colors"
          >
            {integration}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default IntegrationsSection;
