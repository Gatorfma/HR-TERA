import { motion } from "framer-motion";
import { Sparkles, Clock } from "lucide-react";

interface Campaign {
  title: string;
  description: string;
  validUntil?: string;
}

interface CampaignsSectionProps {
  campaigns: Campaign[];
}

const CampaignsSection = ({ campaigns }: CampaignsSectionProps) => {
  if (!campaigns || campaigns.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Current Campaigns
      </h2>
      <div className="space-y-3">
        {campaigns.map((campaign, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {campaign.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {campaign.description}
                </p>
              </div>
              {campaign.validUntil && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  Valid until {campaign.validUntil}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CampaignsSection;
