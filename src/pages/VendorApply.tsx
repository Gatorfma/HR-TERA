import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Building2, 
  Check, 
  CreditCard, 
  Globe, 
  Mail, 
  MapPin, 
  Phone, 
  Sparkles, 
  Star, 
  Users, 
  Zap,
  Shield,
  Link as LinkIcon,
  MessageSquare,
  FileText,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Tier } from "@/lib/types";

interface FormData {
  companyName: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  teamSize: string;
  valueProposition: string;
  integrations: string;
  supportChannels: string;
  compliance: string;
  notes: string;
}

const VendorApply = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const productId = searchParams.get("productId");
  const productSlug = searchParams.get("productSlug");
  
  const [selectedTier, setSelectedTier] = useState<Tier>("freemium");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    website: "",
    email: "",
    phone: "",
    location: "",
    teamSize: "",
    valueProposition: "",
    integrations: "",
    supportChannels: "",
    compliance: "",
    notes: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { number: 1, label: "Şirket bilgilerini doldurun" },
    { number: 2, label: "Paketi seçin" },
    { number: 3, label: "Ödemeyi tamamlayın (yakında)" },
    { number: 4, label: "Doğrulama ve yayın" },
  ];

  const tiers = [
    {
      id: "freemium" as const,
      name: "Freemium",
      subtitle: "Hızlı başlangıç",
      price: "Ücretsiz",
      priceNote: "Yıllık planla ek indirim",
      features: ["Temel listeleme"],
      buttonText: "Seçildi",
      isPopular: false,
      isBest: false,
      color: "bg-cyan-500",
    },
    {
      id: "silver" as const,
      name: "Silver",
      subtitle: "Öne çıkan + Analitik",
      price: "$99",
      period: "/ay",
      priceNote: "Yıllık $999",
      features: ["Öne çıkarma", "Temel analitik", "Freemium'a kıyasla 3x görünürlük"],
      buttonText: "Bu paketi seç",
      isPopular: true,
      isBest: false,
      color: "bg-violet-500",
    },
    {
      id: "gold" as const,
      name: "Gold",
      subtitle: "Premium görünürlük + Destek",
      price: "$199",
      period: "/ay",
      priceNote: "Yıllık $1999",
      features: ["Premium görünürlük", "Gelişmiş analitik", "Öncelikli destek", "Freemium'a kıyasla 3x görünürlük"],
      buttonText: "Bu paketi seç",
      isPopular: false,
      isBest: true,
      color: "bg-amber-500",
    },
  ];

  const handleSubmit = () => {
    if (!formData.companyName || !formData.website) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Başvurunuz alındı!",
      description: "En kısa sürede sizinle iletişime geçeceğiz.",
    });

    // In a real app, this would submit to an API
    console.log("Form submitted:", { ...formData, selectedTier, productId, productSlug });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link 
              to={productSlug ? `/products/${productSlug}` : "/vendors"}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri</span>
            </Link>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">
                  Tedarikçi Olmak için Başvurun
                </h1>
                <p className="text-muted-foreground">
                  Şirket bilgilerinizi paylaşın, paketinizi seçin ve doğrulanmış satıcı olun.
                </p>
                {productSlug && (
                  <Badge variant="secondary" className="mt-2">
                    Ürün: {productSlug}
                  </Badge>
                )}
              </div>
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                VIP Onboarding
              </Badge>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Company Info Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-heading font-bold text-foreground">Şirket Bilgileri</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  company_info tablosundaki alanlar ve gelecekteki detaylar için form
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-foreground">
                      Zorunlu - Şirket Adı
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Örn: HRTech Yazılım A.Ş."
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-foreground">
                      Zorunlu - Website
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="https://"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      İletişim Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@sirket.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Telefon
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+90 ..."
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-foreground">
                      Merkez / Bölge
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="İstanbul, TR"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="space-y-2">
                    <Label htmlFor="teamSize" className="text-foreground">
                      Takım Büyüklüğü
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="teamSize"
                        placeholder="50-100"
                        value={formData.teamSize}
                        onChange={(e) => handleInputChange("teamSize", e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {/* Value Proposition */}
                  <div className="space-y-2">
                    <Label htmlFor="valueProposition" className="text-foreground">
                      Öne Çıkan Değer Önerisi
                    </Label>
                    <Input
                      id="valueProposition"
                      placeholder="Neyi benzersiz yapıyorsunuz?"
                      value={formData.valueProposition}
                      onChange={(e) => handleInputChange("valueProposition", e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  {/* Integrations */}
                  <div className="space-y-2">
                    <Label htmlFor="integrations" className="text-foreground">
                      Entegrasyonlar
                    </Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="integrations"
                        placeholder="Örn: SAP, Workday, Slack"
                        value={formData.integrations}
                        onChange={(e) => handleInputChange("integrations", e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {/* Support Channels */}
                  <div className="space-y-2">
                    <Label htmlFor="supportChannels" className="text-foreground">
                      Destek Kanalları
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="supportChannels"
                        placeholder="E-posta, chat, telefon"
                        value={formData.supportChannels}
                        onChange={(e) => handleInputChange("supportChannels", e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {/* Compliance */}
                  <div className="space-y-2">
                    <Label htmlFor="compliance" className="text-foreground">
                      Uyumluluk / Sertifikalar
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="compliance"
                        placeholder="ISO27001, GDPR, KVKK"
                        value={formData.compliance}
                        onChange={(e) => handleInputChange("compliance", e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes" className="text-foreground">
                      Ek Notlar (gelecek alanlar için taslak)
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="notes"
                        placeholder="Ek belge, referans veya ürün linkleri"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        className="pl-10 bg-background min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Şu an company_info kaydına yalnızca ad ve web sitesi yazılıyor; diğer alanlar gelecek yama genişlemesi için toplanıyor.
                </p>
              </motion.div>

              {/* Package Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground mb-1">
                    Paketinizi Seçin
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Silver ve Gold, Freemium'a kıyasla yan yana güçlü avantajlar sunuyor.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {tiers.map((tier) => (
                    <motion.div
                      key={tier.id}
                      whileHover={{ y: -4 }}
                      className={`relative bg-card rounded-2xl border-2 p-6 transition-all cursor-pointer ${
                        selectedTier === tier.id 
                          ? "border-primary shadow-lg shadow-primary/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTier(tier.id)}
                    >
                      {/* Badges */}
                      <div className="absolute -top-3 right-4 flex gap-2">
                        {tier.isPopular && (
                          <Badge className="bg-violet-500 text-white text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            En Çok Tercih Edilen
                          </Badge>
                        )}
                        {tier.isBest && (
                          <Badge className="bg-amber-500 text-white text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            En İyi Değer
                          </Badge>
                        )}
                      </div>

                      {/* Premium Badge for Gold */}
                      {tier.id === "gold" && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}

                      {/* Tier Name */}
                      <div className="mb-4">
                        <h3 className={`text-lg font-bold ${
                          tier.id === "freemium" ? "text-cyan-500" :
                          tier.id === "silver" ? "text-violet-500" :
                          "text-amber-500"
                        }`}>
                          {tier.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{tier.subtitle}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                          {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{tier.priceNote}</p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            {feature.includes("görünürlük") ? (
                              <Zap className={`w-4 h-4 ${
                                tier.id === "silver" ? "text-violet-500" : "text-amber-500"
                              }`} />
                            ) : (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                            <span className={feature.includes("görünürlük") ? (
                              tier.id === "silver" ? "text-violet-500" : "text-amber-500"
                            ) : "text-foreground"}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Button */}
                      <Button 
                        className={`w-full ${
                          selectedTier === tier.id 
                            ? tier.id === "freemium" ? "bg-cyan-500 hover:bg-cyan-600" :
                              tier.id === "silver" ? "bg-violet-500 hover:bg-violet-600" :
                              "bg-amber-500 hover:bg-amber-600"
                            : "bg-transparent border border-border text-foreground hover:bg-muted"
                        }`}
                        variant={selectedTier === tier.id ? "default" : "outline"}
                      >
                        {selectedTier === tier.id ? "Seçildi" : tier.buttonText}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Section Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl font-heading font-bold text-foreground">
                    Ödeme (3. parti sağlayıcı placeholder)
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Paket seçiminizi kaydedin; ödeme entegrasyonu eklendiğinde buradan devam edeceğiz.
                </p>
                <p className="text-xs text-muted-foreground">
                  Kaydı tamamladığınızda seçtiğiniz plan (örn. Freemium) hesabınıza işlenecek. Ödeme sağlayıcısı entegre olduğunda burada yönlendirme yapılacak.
                </p>
                <div className="flex justify-end mt-4">
                  <span className="text-sm text-primary">Güvenli Ödeme Yakında</span>
                </div>
              </motion.div>

              <p className="text-xs text-muted-foreground text-right">
                💳 Ödeme bağlantısı yakında
              </p>
            </div>

            {/* Sidebar - Steps */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-28"
              >
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-bold text-foreground">Adımlar</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Profilinizi tamamlayın ve paketinizi seçin
                  </p>

                  <ul className="space-y-4">
                    {steps.map((step) => (
                      <li key={step.number} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentStep >= step.number 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {currentStep > step.number ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-xs">{step.number}</span>
                          )}
                        </div>
                        <span className={`text-sm ${
                          currentStep >= step.number 
                            ? "text-foreground" 
                            : "text-muted-foreground"
                        }`}>
                          {step.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={handleSubmit}
                    className="w-full mt-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    size="lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Kaydet ve Devam Et
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    📋 1 aşama
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorApply;
