import { Headphones } from "lucide-react";
import { Tier } from "@/data/products";

interface SupportHighlightProps {
  tier: Tier;
}

const SupportHighlight = ({ tier }: SupportHighlightProps) => {
  if (tier === "freemium") return null;

  const text = tier === "premium"
    ? "Premium listings receive premium support with dedicated account management."
    : "Plus listings receive priority marketplace support.";

  return (
    <div className="bg-muted/50 rounded-xl border border-border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Headphones className="w-5 h-5 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {tier === "premium" ? "Premium Support" : "Priority Support"}:
        </span>{" "}
        {text}
      </p>
    </div>
  );
};

export default SupportHighlight;
