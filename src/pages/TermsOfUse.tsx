import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const TermsOfUse = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {language === "tr" ? "Kullanım Şartları" : "Terms of Use"}
            </h1>
          </header>

          <section className="space-y-6 text-muted-foreground">
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Hizmet Tanımı" : "Service Description"}
              </h2>
              <p>
                {language === "tr"
                  ? "HRTera, İK teknolojilerini listeleyen, karşılaştırma imkanı sunan bağımsız bir pazaryeridir."
                  : "HRTera is an independent marketplace that lists HR technologies and offers comparison capabilities."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "İçerik Sorumluluğu" : "Content Responsibility"}
              </h2>
              <p>
                {language === "tr"
                  ? "Platformda yer alan ürün detayları, özellikler ve görseller ilgili çözüm sağlayıcılar tarafından sağlanır. HRTera, bu bilgilerin doğruluğunu kontrol etme hakkını saklı tutar ancak içeriğin nihai doğruluğundan ilgili çözüm sağlayıcı sorumludur."
                  : "Product details, features, and images on the platform are provided by the relevant solution providers. HRTera reserves the right to verify the accuracy of this information, but the relevant solution provider is responsible for the final accuracy of the content."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Garanti Reddi" : "Disclaimer of Warranty"}
              </h2>
              <p>
                {language === "tr"
                  ? "HRTera, listelenen çözümlerin performansı veya hizmet kalitesi hakkında hukuki bir garanti vermez. Seçim ve satın alma kararı tamamen kullanıcıya aittir."
                  : "HRTera does not provide any legal guarantee regarding the performance or service quality of listed solutions. The selection and purchasing decision is entirely the user's responsibility."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Yönetim Hakları" : "Management Rights"}
              </h2>
              <p>
                {language === "tr"
                  ? "HRTera, yanıltıcı içerikleri kaldırma veya kullanım şartlarını ihlal eden üyelikleri askıya alma yetkisine sahiptir."
                  : "HRTera has the authority to remove misleading content or suspend memberships that violate the terms of use."}
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
