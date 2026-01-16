import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface ImpactMetricsSectionProps {
  metrics: { label: string; value: string }[];
}

const ImpactMetricsSection = ({ metrics }: ImpactMetricsSectionProps) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Results & Impact
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-5 text-center"
          >
            <p className="text-3xl font-bold text-primary mb-1">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ImpactMetricsSection;
