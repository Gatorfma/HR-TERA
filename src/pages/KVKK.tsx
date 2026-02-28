import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const KVKK = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {language === "tr" ? "KVKK Aydınlatma Metni" : "KVKK Disclosure Notice"}
            </h1>
          </header>

          <section className="space-y-6 text-muted-foreground">
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Veri Sorumlusu" : "Data Controller"}
              </h2>
              <p>
                {language === "tr"
                  ? "Artemiz Güler Danışmanlık olarak, 6698 sayılı KVKK uyarınca verilerinizin güvenliğinden sorumluyuz."
                  : "As Artemiz Güler Danışmanlık, we are responsible for the security of your data in accordance with the Personal Data Protection Law No. 6698 (KVKK)."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "İşlenen Veriler" : "Processed Data"}
              </h2>
              <p>
                {language === "tr"
                  ? "Kimlik (ad-soyad), iletişim (e-posta, telefon), kurumsal bilgiler (şirket adı), dijital izler (IP ve işlem kayıtları) ve platform içi etkileşimleriniz (toplantı/demo talepleri)."
                  : "Identity (name-surname), contact (email, phone), corporate information (company name), digital traces (IP and transaction logs), and your in-platform interactions (meeting/demo requests)."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Hukuki Sebep ve Amaç" : "Legal Basis and Purpose"}
              </h2>
              <p>
                {language === "tr"
                  ? "Üyelik süreçlerinin yönetimi, karşılaştırma ve favori listesi gibi hizmetlerin sunulması, toplantı/demo taleplerinin ilgili çözüm sağlayıcılara güvenli aktarımı ve yasal yükümlülüklerin yerine getirilmesi."
                  : "Management of membership processes, provision of services such as comparison and favorite lists, secure transfer of meeting/demo requests to relevant solution providers, and fulfillment of legal obligations."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Veri Aktarımı" : "Data Transfer"}
              </h2>
              <p>
                {language === "tr"
                  ? "Toplantı/Demo veya bilgi talebi oluşturduğunuzda, bu talebin karşılanması amacıyla bilgileriniz yalnızca seçtiğiniz çözüm sağlayıcıya aktarılır. İlgili firma, bu noktadan sonra kendi veri politikalarından sorumludur."
                  : "When you create a meeting/demo or information request, your information is transferred only to the solution provider you select in order to fulfill that request. The relevant company is responsible for its own data policies from that point forward."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {language === "tr" ? "Haklarınız" : "Your Rights"}
              </h2>
              <p>
                {language === "tr"
                  ? "Verilerinize erişim, düzeltme, silme veya işleme itiraz haklarınızı info@hrtera.co üzerinden kullanabilirsiniz."
                  : "You can exercise your rights to access, correct, delete, or object to processing of your data via info@hrtera.co."}
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KVKK;
