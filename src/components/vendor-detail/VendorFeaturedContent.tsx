import { motion } from "framer-motion";
import { ExternalLink, FileText, Video, BookOpen } from "lucide-react";
import { VendorFeaturedContent } from "@/data/vendors";

interface VendorFeaturedContentSectionProps {
  content: VendorFeaturedContent[];
}

const VendorFeaturedContentSection = ({ content }: VendorFeaturedContentSectionProps) => {
  if (!content || content.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "webinar":
      case "video":
        return <Video className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">
        Resources & Insights
      </h2>
      <div className="space-y-3">
        {content.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {item.description}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default VendorFeaturedContentSection;
