import { BadgeCheck, Search } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useRef, useMemo } from "react";
import { DashboardProduct } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroSectionProps {
  products?: DashboardProduct[];
}

const HeroSection = ({ products = [] }: HeroSectionProps) => {
  const [topRowPaused, setTopRowPaused] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const { scrollY } = useScroll();
  
  // Parallax transforms for different layers
  const y1 = useTransform(scrollY, [0, 500], [0, 80]);
  const y2 = useTransform(scrollY, [0, 500], [0, 120]);
  const y3 = useTransform(scrollY, [0, 500], [0, 60]);
  const rotate1 = useTransform(scrollY, [0, 500], [0, 5]);
  const rotate2 = useTransform(scrollY, [0, 500], [0, -3]);

  // Map DashboardProduct to carousel format and create duplicated arrays for seamless infinite scroll
  const mappedProducts = useMemo(() => {
    return products.map((product) => ({
      id: product.product_id,
      product_id: product.product_id,
      image: product.logo,
      category: product.main_category,
      name: product.product_name,
      isVerified: product.is_verified,
    }));
  }, [products]);

  const topRowProducts = useMemo(() => [...mappedProducts, ...mappedProducts], [mappedProducts]);

  return (
    <section className="relative">
      {/* Hero Band with Gradient - Limited Height */}
      <div ref={heroRef} className="relative h-[65vh] min-h-[550px] max-h-[750px] overflow-hidden pt-24">
        {/* Parchment Gradient Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #A3F000 0%, #ADFF00 50%, #BFFF33 100%)',
          }}
        />

        {/* Layered Background Shapes for Depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large panel - top left corner */}
          <motion.div 
            className="absolute -top-20 -left-16 w-80 h-64 rounded-[2.5rem] opacity-[0.12]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.1)',
              rotate: '-8deg',
              filter: 'blur(1px)',
              y: y1,
            }}
          />
          
          {/* Medium panel - top right */}
          <motion.div 
            className="absolute -top-10 right-12 w-56 h-48 rounded-[2rem] opacity-[0.1]"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.3) 0%, transparent 70%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 15px rgba(255,255,255,0.08)',
              rotate: rotate1,
              y: y2,
            }}
          />

          {/* Small accent - top center-right */}
          <motion.div 
            className="absolute top-32 right-1/4 w-32 h-24 rounded-2xl opacity-[0.08]"
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              rotate: rotate2,
              filter: 'blur(0.5px)',
              y: y3,
            }}
          />

          {/* Large panel - left side */}
          <motion.div 
            className="absolute top-1/3 -left-24 w-72 h-80 rounded-[3rem] opacity-[0.09]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'inset 0 4px 30px rgba(255,255,255,0.06)',
              rotate: '12deg',
              filter: 'blur(2px)',
              y: y2,
            }}
          />

          {/* Large panel - right side */}
          <motion.div 
            className="absolute top-1/4 -right-20 w-64 h-96 rounded-[2.5rem] opacity-[0.1]"
            style={{
              background: 'linear-gradient(200deg, rgba(255,255,255,0.3) 0%, transparent 60%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 2px 25px rgba(255,255,255,0.05)',
              rotate: rotate2,
              filter: 'blur(1.5px)',
              y: y1,
            }}
          />

          {/* Small floating accent - left middle */}
          <motion.div 
            className="absolute top-[45%] left-16 w-24 h-20 rounded-xl opacity-[0.07]"
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.12)',
              rotate: rotate1,
              y: y3,
            }}
          />

          {/* Medium panel - bottom left area */}
          <motion.div 
            className="absolute bottom-1/4 -left-12 w-48 h-56 rounded-[2rem] opacity-[0.08]"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 80%)',
              border: '1px solid rgba(255,255,255,0.1)',
              rotate: '-10deg',
              filter: 'blur(1px)',
              y: y1,
            }}
          />

          {/* Small accent - right side lower */}
          <motion.div 
            className="absolute bottom-1/3 right-8 w-36 h-28 rounded-2xl opacity-[0.06]"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.08)',
              rotate: rotate1,
              filter: 'blur(0.5px)',
              y: y2,
            }}
          />

          {/* Extra large background panel - deep layer */}
          <motion.div 
            className="absolute top-20 left-1/3 w-96 h-72 rounded-[3.5rem] opacity-[0.04]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 50%)',
              rotate: rotate2,
              filter: 'blur(3px)',
              y: y3,
            }}
          />

          {/* Subtle dark accent for contrast - bottom right */}
          <motion.div 
            className="absolute bottom-[20%] right-1/4 w-40 h-32 rounded-3xl opacity-[0.03]"
            style={{
              background: 'rgba(0,0,0,0.1)',
              rotate: '-5deg',
              filter: 'blur(2px)',
              y: y1,
            }}
          />
        </div>
        
        {/* Noise/Grain Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Hero Content */}
        <div className="container relative z-10 flex flex-col items-center justify-center text-center px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="inline-block bg-card text-[#111827] px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
              {t("hero.badge")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-[#111827] max-w-4xl leading-tight"
          >
            <span className="block leading-snug">
              {t("hero.title1")}
            </span>
            <span className="block">
              {t("hero.title2")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base md:text-lg text-[#374151] max-w-2xl"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 w-full max-w-xl"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("hero.searchPlaceholder")}
                className="w-full bg-card text-foreground rounded-full py-3.5 pl-14 pr-6 text-base shadow-card focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        </div>

        {/* Smooth Bottom Transition - Curved fade */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)',
          }}
        />
      </div>

      {/* Product Carousels - Overlapping into both zones */}
      <div className="relative -mt-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="overflow-hidden"
        >
          {/* Top Row - Scrolls Left to Right */}
          <div
            className="relative"
            onMouseEnter={() => setTopRowPaused(true)}
            onMouseLeave={() => setTopRowPaused(false)}
          >
            <div 
              className="flex gap-4 will-change-transform"
              style={{
                animation: 'scroll-left 30s linear infinite',
                animationPlayState: topRowPaused ? 'paused' : 'running',
              }}
            >
              {topRowProducts.map((product, index) => (
                <Link
                  key={`top-${product.product_id}-${index}`}
                  to={`/products/${product.product_id}`}
                  className="flex-shrink-0 group"
                >
                  <div className="w-48 md:w-56 lg:w-64 bg-card rounded-xl overflow-hidden shadow-card border border-border/50 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                    <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Category Label */}
                      <span className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      {product.isVerified && (
                        <span className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                          <BadgeCheck className="h-4 w-4 text-white" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar - On normal background */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="container mt-12 pb-12 relative z-10"
      >
        <div className="bg-card rounded-2xl p-8 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#111827]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-heading font-bold text-foreground">{t("hero.stat1.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("hero.stat1.desc")}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#111827]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-heading font-bold text-foreground">{t("hero.stat2.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("hero.stat2.desc")}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#111827]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-heading font-bold text-foreground">{t("hero.stat3.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("hero.stat3.desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
