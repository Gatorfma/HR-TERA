import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Linkedin, Twitter, Instagram, Youtube } from "lucide-react";

const NEWSLETTER_STORAGE_KEY = "hrtera_newsletter_subscribers";
const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const Footer = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      toast({
        title: t("footer.newsletter.invalidEmail"),
        variant: "destructive",
      });
      return;
    }

    const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    const subscriptions = stored ? JSON.parse(stored) : [];
    const alreadySubscribed = subscriptions.some(
      (entry: { email: string }) => entry.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (!alreadySubscribed) {
      subscriptions.push({ email: trimmedEmail, createdAt: new Date().toISOString() });
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(subscriptions));
    }

    setEmail("");
    toast({
      title: alreadySubscribed ? t("footer.newsletter.alreadySubscribed") : t("footer.newsletter.subscriptionSaved"),
    });
  };

  return (
    <footer className="bg-secondary py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Newsletter */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img
                src={`${import.meta.env.BASE_URL}hrtera-icon.png`}
                alt="HRTera logo"
                className="w-6 h-6 object-contain"
              />
              <span className="font-heading font-bold text-xl text-secondary-foreground">HRTera.co</span>
            </Link>

            <h3 className="font-heading font-bold text-lg text-secondary-foreground mb-2">
              {t("footer.newsletter.title")}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("footer.newsletter.desc")}
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                placeholder={t("footer.newsletter.placeholder")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="flex-1 bg-transparent border border-muted-foreground/30 rounded-full px-4 py-2 text-sm text-secondary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t("footer.newsletter.button")}
              </Button>
            </form>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading font-bold text-secondary-foreground mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.blog")}</Link></li>
              <li><Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.products")}</Link></li>
              <li><a href={`${import.meta.env.BASE_URL}#pricing`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.pricing")}</a></li>
              <li><Link to="/story" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.story")}</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-heading font-bold text-secondary-foreground mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.terms")}</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.privacy")}</Link></li>
            </ul>

            <h4 className="font-heading font-bold text-secondary-foreground mt-8 mb-4">{t("footer.followUs")}</h4>
            <div className="flex gap-3">
              {[
                { name: "linkedin", href: "https://www.linkedin.com", icon: Linkedin },
                { name: "twitter", href: "https://twitter.com", icon: Twitter },
                { name: "instagram", href: "https://www.instagram.com", icon: Instagram },
                { name: "youtube", href: "https://www.youtube.com", icon: Youtube },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <span className="sr-only">{social.name}</span>
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-muted-foreground/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{t("footer.rights")}</p>
          <p className="text-sm text-muted-foreground">{t("footer.legal")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
