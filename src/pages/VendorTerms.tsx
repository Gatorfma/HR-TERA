import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const VendorTerms = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {language === "tr" ? "Çözüm Sağlayıcı Katılım Şartları" : "Solution Provider Participation Terms"}
            </h1>
          </header>

          <section className="space-y-6 text-muted-foreground">
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "İçerik Yönetimi" : "Content Management"}
              </h2>
              <p>
                {language === "tr"
                  ? "Çözüm sağlayıcılar, kendilerine ayrılan panel üzerinden ürün bilgilerini güncel tutmakla yükümlüdür."
                  : "Solution providers are obligated to keep their product information up to date through their dedicated panel."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Üyelik Modelleri" : "Membership Models"}
              </h2>
              <p>
                {language === "tr"
                  ? "Platformda Free, Pro ve Premium olmak üzere farklı görünürlük seviyeleri sunulur. Ücretli paketler (Pro/Premium) ek bir hizmet sözleşmesine tabidir."
                  : "The platform offers different visibility levels: Free, Pro, and Premium. Paid packages (Pro/Premium) are subject to an additional service agreement."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Lead (Talep) Yönetimi" : "Lead Management"}
              </h2>
              <p>
                {language === "tr"
                  ? "Gelen demo ve toplantı talepleri çözüm sağlayıcı paneline iletilir; bu noktadan sonraki müşteri iletişimi ve satış süreci tamamen çözüm sağlayıcının sorumluluğundadır."
                  : "Incoming demo and meeting requests are forwarded to the solution provider panel; from that point forward, customer communication and the sales process are entirely the responsibility of the solution provider."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Onay Süreci" : "Approval Process"}
              </h2>
              <p>
                {language === "tr"
                  ? "Eklenen tüm içerikler, platform kalitesini korumak adına HRTera editör onayından geçtikten sonra yayına alınır."
                  : "All added content is published only after passing HRTera editorial approval in order to maintain platform quality."}
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorTerms;
