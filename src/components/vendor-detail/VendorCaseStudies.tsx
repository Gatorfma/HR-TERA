import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { VendorCaseStudy } from "@/data/vendors";

interface VendorCaseStudiesProps {
  caseStudies: VendorCaseStudy[];
}

const VendorCaseStudies = ({ caseStudies }: VendorCaseStudiesProps) => {
  if (!caseStudies || caseStudies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">
        Case Studies
      </h2>
      <div className="space-y-6">
        {caseStudies.map((study) => (
          <div key={study.id} className="border border-border rounded-xl overflow-hidden">
            {study.thumbnail && (
              <div className="aspect-[3/1] overflow-hidden bg-muted">
                <img
                  src={study.thumbnail}
                  alt={study.clientName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-5">
              <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                {study.clientName}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-foreground">Challenge: </span>
                  <span className="text-muted-foreground">{study.challenge}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Solution: </span>
                  <span className="text-muted-foreground">{study.solution}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Results: </span>
                  <span className="text-muted-foreground">{study.results}</span>
                </div>
              </div>
              {study.metrics && study.metrics.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                  {study.metrics.map((metric, index) => (
                    <div key={index} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{metric.label}: {metric.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default VendorCaseStudies;
