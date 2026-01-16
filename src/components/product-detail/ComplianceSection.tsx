import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface ComplianceSectionProps {
  compliance: string[];
}

const ComplianceSection = ({ compliance }: ComplianceSectionProps) => {
  if (!compliance || compliance.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        Compliance & Security
      </h2>
      <div className="flex flex-wrap gap-3">
        {compliance.map((badge, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium border border-green-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            {badge}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default ComplianceSection;
