import { motion } from "framer-motion";
import { ExternalLink, FileText, Video, BookOpen, BarChart3, Newspaper } from "lucide-react";
import { FeaturedContent } from "@/data/products";

interface FeaturedContentSectionProps {
  content: FeaturedContent[];
}

const typeIcons: Record<FeaturedContent["type"], React.ComponentType<{ className?: string }>> = {
  blog: Newspaper,
  whitepaper: FileText,
  "case-study": BookOpen,
  webinar: Video,
  report: BarChart3,
};

const FeaturedContentSection = ({ content }: FeaturedContentSectionProps) => {
  if (!content || content.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Featured Content
      </h2>
      <div className="space-y-3">
        {content.map((item, index) => {
          const Icon = typeIcons[item.type] || FileText;
          return (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </a>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FeaturedContentSection;
