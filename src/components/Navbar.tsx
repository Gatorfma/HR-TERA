import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import AuthModal from "@/components/AuthModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import LanguageToggle from "@/components/LanguageToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setShowAuthModal(true);
    window.addEventListener("open-auth-modal", handler);
    return () => window.removeEventListener("open-auth-modal", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
        <div className="bg-card/95 backdrop-blur-md rounded-full px-6 py-3 shadow-card border border-border">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}hrtera-nobg-icon.png`}
                alt="HRTera logo"
                className="w-6 h-6 object-contain"
              />
              <span className="font-heading font-bold text-xl text-foreground">HRTera</span>
            </Link>

            {/* Desktop Nav - Centered */}
            <div className="hidden desktop:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              <Link to="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {t("nav.categories")}
              </Link>
              <Link to="/compare" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {t("nav.compare")}
              </Link>
              <Link to="/trending" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {t("nav.trending")}
              </Link>
              <Link to="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {t("nav.hrtech_radar")}
              </Link>
              <a href={`${import.meta.env.BASE_URL}#pricing`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {t("nav.pricing")}
              </a>
            </div>

            {/* Search & CTA */}
            <div className="hidden desktop:flex items-center gap-3">
              <LanguageToggle />
              {isLoading ? (
                <div className="w-20 h-10 bg-muted/50 rounded-full animate-pulse" />
              ) : isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-full bg-secondary text-secondary-foreground px-6 border-2 border-transparent hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  {t("nav.login")}
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="desktop:hidden flex items-center gap-2">
              <LanguageToggle />
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-foreground hover:text-primary transition-colors"
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                className="p-2"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-card border border-border"
            >
              <SearchBar onClose={() => setShowSearch(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="desktop:hidden mt-2 bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-card border border-border"
            >
              <div className="flex flex-col gap-4">
                <Link to="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                  {t("nav.categories")}
                </Link>
                <Link to="/compare" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                  {t("nav.compare")}
                </Link>
                <Link to="/trending" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                  {t("nav.trending")}
                </Link>
                <Link to="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                  {t("nav.hrtech_radar")}
                </Link>
                <a href={`${import.meta.env.BASE_URL}#pricing`} className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                  {t("nav.pricing")}
                </a>
                {isLoading ? (
                  <div className="w-full h-10 bg-muted/50 rounded-full animate-pulse" />
                ) : isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="block">
                      <Button className="rounded-full bg-secondary text-secondary-foreground w-full">
                        {t("nav.profile")}
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleLogout}
                      className="rounded-full bg-secondary text-secondary-foreground w-full"
                    >
                      {t("profile.logout")}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="rounded-full bg-secondary text-secondary-foreground w-full border-2 border-transparent hover:border-primary transition-all duration-200"
                  >
                    {t("nav.login")}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Navbar;
