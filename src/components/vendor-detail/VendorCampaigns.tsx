import { motion } from "framer-motion";
import { Sparkles, Calendar } from "lucide-react";

interface Campaign {
  title: string;
  description: string;
  validUntil?: string;
}

interface VendorCampaignsProps {
  campaigns: Campaign[];
}

const VendorCampaigns = ({ campaigns }: VendorCampaignsProps) => {
  if (!campaigns || campaigns.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-heading font-bold text-foreground">
          Current Campaigns
        </h2>
      </div>
      <div className="space-y-4">
        {campaigns.map((campaign, index) => (
          <div key={index} className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-heading font-bold text-foreground mb-1">
              {campaign.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {campaign.description}
            </p>
            {campaign.validUntil && (
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                <Calendar className="w-3 h-3" />
                Valid until {campaign.validUntil}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default VendorCampaigns;
