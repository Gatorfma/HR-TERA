import { motion } from "framer-motion";
import { Globe, Languages } from "lucide-react";

interface AvailabilitySectionProps {
  countries?: string[];
  languages?: string[];
}

const AvailabilitySection = ({ countries, languages }: AvailabilitySectionProps) => {
  if ((!countries || countries.length === 0) && (!languages || languages.length === 0)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {countries && countries.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-lg font-heading font-bold text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Available In
            </h3>
            <div className="flex flex-wrap gap-2">
              {countries.map((country, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-muted rounded-lg text-sm text-foreground"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-lg font-heading font-bold text-foreground mb-3 flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-muted rounded-lg text-sm text-foreground"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AvailabilitySection;
