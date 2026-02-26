import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacySecurity = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {language === "tr" ? "Gizlilik ve Güvenlik Politikası" : "Privacy and Security Policy"}
            </h1>
          </header>

          <section className="space-y-6 text-muted-foreground">
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Sıfır İzinli Pazarlama" : "Zero-Permission Marketing"}
              </h2>
              <p>
                {language === "tr"
                  ? "HRTera, bireysel kullanıcı veya çözüm sağlayıcı verilerini üçüncü taraflara satmaz veya izinsiz pazarlama faaliyetleri için paylaşmaz."
                  : "HRTera does not sell individual user or solution provider data to third parties or share it for unauthorized marketing activities."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Güvenlik Standartları" : "Security Standards"}
              </h2>
              <p>
                {language === "tr"
                  ? "Platform, verilerin korunması için makul düzeyde teknik ve idari önlemleri almaktadır."
                  : "The platform takes reasonable technical and administrative measures to protect data."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Kullanıcı Sorumluluğu" : "User Responsibility"}
              </h2>
              <p>
                {language === "tr"
                  ? "Hesap bilgilerinin ve şifre güvenliğinin sağlanması kullanıcının kendi sorumluluğundadır."
                  : "Ensuring the security of account information and passwords is the user's own responsibility."}
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacySecurity;
