import { Link } from "react-router-dom";
import { Building2, MapPin, Globe, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import VendorTierBadge from "@/components/vendor-detail/VendorTierBadge";

const ProfileHero = () => {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getPlanLink = () => {
    if (user.vendorTier === "freemium") {
      return { text: "View plans / upgrade", href: `${import.meta.env.BASE_URL}#pricing` };
    }
    return { text: "Manage plan", href: "/profile?tab=settings" };
  };

  const planLink = getPlanLink();

  const tierLabels = {
    freemium: "Freemium",
    plus: "Plus",
    premium: "Premium"
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Cover gradient */}
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
      
      <div className="px-6 pb-6 -mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-card shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center border-4 border-card shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">
                {user.fullName || user.company}
              </h1>
              <VendorTierBadge tier={user.vendorTier} size="md" />
            </div>
            
            {user.tagline && (
              <p className="text-muted-foreground mb-3">{user.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {user.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {user.company}
                </span>
              )}
              {user.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </span>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Plan status */}
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Current plan:</span>
          <span className="font-medium text-foreground">{tierLabels[user.vendorTier]}</span>
          <span className="text-muted-foreground">•</span>
          <Link
            to={planLink.href}
            className="text-primary hover:underline font-medium"
          >
            {planLink.text}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
