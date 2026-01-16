import { motion } from "framer-motion";
import { UseCase } from "@/data/products";
import { 
  Users, 
  Target, 
  MessageSquare, 
  GraduationCap, 
  Award, 
  Briefcase,
  Lightbulb
} from "lucide-react";

interface UseCasesSectionProps {
  useCases: UseCase[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Target,
  MessageSquare,
  GraduationCap,
  Award,
  Briefcase,
  Lightbulb,
};

const UseCasesSection = ({ useCases }: UseCasesSectionProps) => {
  if (!useCases || useCases.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
        Use Cases
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {useCases.map((useCase, index) => {
          const Icon = iconMap[useCase.icon] || Lightbulb;
          return (
            <div
              key={index}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">
                {useCase.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {useCase.description}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default UseCasesSection;
