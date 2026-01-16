import { useLanguage, Language } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tr" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-all duration-200 border border-border text-sm font-medium"
      aria-label="Toggle language"
    >
      <span
        className={`px-1.5 py-0.5 rounded-md transition-all duration-200 ${
          language === "tr"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        TR
      </span>
      <span className="text-muted-foreground">/</span>
      <span
        className={`px-1.5 py-0.5 rounded-md transition-all duration-200 ${
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        EN
      </span>
    </button>
  );
};

export default LanguageToggle;

