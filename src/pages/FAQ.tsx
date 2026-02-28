import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const FAQ = () => {
  const { language } = useLanguage();

  const sections: FAQSection[] =
    language === "tr"
      ? [
          {
            title: "İnsan Kaynakları Profesyonelleri İçin",
            items: [
              {
                question: "HRTera nedir?",
                answer:
                  "HRTera, İnsan Kaynakları profesyonellerinin, İnsan Kaynakları alanındaki hem yerli hem de yabancı tüm teknolojik ürünleri/çözümleri ve çözüm sağlayıcıları keşfetmesini, karşılaştırmasını ve doğru teknolojiye daha hızlı karar vermesini sağlayan bağımsız bir İnsan Kaynakları Teknolojileri pazaryeridir.",
              },
              {
                question: "HRTera'yı kullanmak ücretli mi?",
                answer:
                  "Hayır. İnsan Kaynakları profesyonelleri için platform kullanımı ücretsizdir. Ücretsiz üyelikle çözümleri filtreleyebilir, karşılaştırma yapabilir, favori liste oluşturabilir, çözüm sağlayıcılara toplantı/demo isteği gönderebilir, değerlendirme/yorum yazabilir, çözümleri beğenip paylaşabilir ve HRTech Radar'daki tüm içeriğe erişebilirsiniz. Ücretsiz üye olarak kişiselleştirilmiş öneriler de alabilirsiniz.",
              },
              {
                question: "HRTera'daki çözümler nasıl seçiliyor?",
                answer:
                  "Platformda yer alan çözümler, kategori ve içerik uygunluğu açısından incelenir. Amaç, İnsan Kaynakları profesyonellerine güvenilir ve güncel bir çözüm havuzu sunmaktır.",
              },
              {
                question: "Birden fazla çözümü karşılaştırabilir miyim?",
                answer:
                  "Evet. Karşılaştırma özelliği ile ürünleri (en fazla 5) çözümü, yan yana değerlendirerek daha bilinçli karar verebilirsiniz.",
              },
              {
                question: "Toplantı/Demo isteği gönderdiğimde ne olur?",
                answer:
                  "İsteğiniz, doğrudan ilgili çözüm sağlayıcıya iletilir. Süreç, sizinle ve ilgili çözüm sağlayıcı arasında ilerler.",
              },
            ],
          },
          {
            title: "Çözüm Sağlayıcılar İçin",
            items: [
              {
                question: "HRTera'da nasıl yer alabilirim?",
                answer:
                  "Eğer HRTech çözümünüz henüz HRTera'da yoksa; çözümünüzü listelemek için kurumsal üyelik oluşturmanız yeterlidir. Üyelik sonrası, çözüm sağlayıcı paneline erişerek şirket profilinizi düzenleyebilir, ürününüzü ilgili kategorilere ekleyebilir, açıklama, görsel, video ve özellik bilgilerini yükleyebilirsiniz. Tüm listelemeler, HRTera yönetimi tarafından güncelleme öncesi kontrol edilir.",
              },
              {
                question:
                  "Bana ait bir çözümü nasıl düzenleyebilirim?",
                answer:
                  "Öncelikle, sizin çözüm sağlayıcı olduğunuzu anlamamız gerekiyor. Size ait çözüm sayfasından başvurabilirsiniz. Çözüm sağlayıcı paneliniz üzerinden çözüm bilgilerinizi dilediğiniz zaman güncelleyebilirsiniz: açıklama ve özellik değişiklikleri, yeni ekran görüntüleri ve videolar, kategori güncellemeleri, toplantı/demo formu ayarları. Yapılan güncellemeler hızlı onay sürecinin ardından yayına alınır. Aktif ve güncel içerik, daha fazla görünürlük ve lead demektir.",
              },
              {
                question: "Birden fazla çözüm ekleyebilir miyim?",
                answer:
                  "Evet. Üyelik paketine bağlı olarak birden fazla çözüm ve kategori listeleyebilirsiniz. Pro ve Premium üyelikte daha geniş görünürlük ve öne çıkarılma avantajı sunulur.",
              },
              {
                question: "Ücretsiz (Free) üyelik neleri kapsar?",
                answer:
                  "1 kategoride listeleme, şirket adı ve kısa açıklama, website linki ile temel görünürlük sağlar.",
              },
              {
                question:
                  "Pro ve Premium üyelik arasındaki fark nedir?",
                answer:
                  "Pro Üyelik: 3 kategoriye kadar listeleme, detaylı ürün sayfası, görsel ve video ekleme, öncelikli destek sunar. Premium Üyelik: 3+ kategori, öne çıkarılma (featured), lead yönlendirme (toplantı/demo isteği), görüntülenme ve tıklama raporları, sponsorlu görünürlük gibi avantajlar sunar. Premium üyelik, aktif satış yönlendirmesi üretmek isteyen çözüm sağlayıcılar için tasarlanmıştır.",
              },
              {
                question: "Lead yönlendirme nasıl çalışır?",
                answer:
                  "Premium üyelerde, toplantı/demo istekleri doğrudan çözüm sağlayıcının paneline iletilir. Bu yönlendirmeden sonraki süreç, çözüm sağlayıcının sorumluluğundadır.",
              },
              {
                question: "Hangi üyelik bana uygun?",
                answer:
                  "Marka bilinirliği için Free, pazarda görünürlük ve içerik gücü için Pro, aktif satış yönlendirmesi için Premium üyelik uygundur.",
              },
            ],
          },
          {
            title: "Üyelik ve Kurumsal Paketler",
            items: [
              {
                question:
                  "Bireysel üyelik ile kurumsal üyelik farkı nedir?",
                answer:
                  "Bireysel üyelik, İnsan Kaynakları profesyonelleri içindir. Kurumsal üyelik, HRTech çözüm sağlayıcılar içindir.",
              },
              {
                question: "Üyelikler ne kadar süreli?",
                answer:
                  "6 aylık ve 12 aylık plan seçenekleri sunulur. 12 aylık planlar daha avantajlıdır.",
              },
              {
                question: "Üyeliğimi yükseltebilir miyim?",
                answer:
                  "Evet. Dilediğiniz zaman Free → Pro → Premium geçişi yapabilirsiniz.",
              },
            ],
          },
        ]
      : [
          {
            title: "For HR Professionals",
            items: [
              {
                question: "What is HRTera?",
                answer:
                  "HRTera is an independent HR Technologies marketplace that enables HR professionals to discover, compare, and make faster decisions on all domestic and international technology products/solutions and solution providers in the Human Resources field.",
              },
              {
                question: "Is using HRTera paid?",
                answer:
                  "No. Platform usage is free for HR professionals. With free membership you can filter solutions, compare them, create favorite lists, send meeting/demo requests to solution providers, write reviews, like and share solutions, and access all HRTech Radar content. You can also receive personalized recommendations as a free member.",
              },
              {
                question: "How are solutions on HRTera selected?",
                answer:
                  "Solutions on the platform are reviewed for category and content suitability. The goal is to provide HR professionals with a reliable and up-to-date solution pool.",
              },
              {
                question: "Can I compare multiple solutions?",
                answer:
                  "Yes. With the comparison feature, you can evaluate up to 5 products side by side to make more informed decisions.",
              },
              {
                question:
                  "What happens when I send a meeting/demo request?",
                answer:
                  "Your request is forwarded directly to the relevant solution provider. The process continues between you and the solution provider.",
              },
            ],
          },
          {
            title: "For Solution Providers",
            items: [
              {
                question: "How can I get listed on HRTera?",
                answer:
                  "If your HRTech solution is not yet on HRTera, simply create a corporate membership to list your solution. After membership, you can access the solution provider panel to edit your company profile, add your product to relevant categories, and upload descriptions, images, videos, and feature information. All listings are reviewed by HRTera management before publishing.",
              },
              {
                question: "How can I edit a solution that belongs to me?",
                answer:
                  "First, we need to understand that you are the solution provider. You can apply from your solution page. Through your solution provider panel, you can update your solution information at any time: description and feature changes, new screenshots and videos, category updates, and meeting/demo form settings. Updates are published after a quick approval process. Active and up-to-date content means more visibility and leads.",
              },
              {
                question: "Can I add multiple solutions?",
                answer:
                  "Yes. Depending on your membership plan, you can list multiple solutions and categories. Pro and Premium memberships offer wider visibility and featuring advantages.",
              },
              {
                question: "What does the Free membership include?",
                answer:
                  "Listing in 1 category, company name and short description, website link, and basic visibility.",
              },
              {
                question:
                  "What is the difference between Pro and Premium membership?",
                answer:
                  "Pro Membership: listing in up to 3 categories, detailed product page, image and video uploads, priority support. Premium Membership: 3+ categories, featured placement, lead forwarding (meeting/demo requests), view and click reports, and sponsored visibility. Premium membership is designed for solution providers who want to generate active sales referrals.",
              },
              {
                question: "How does lead forwarding work?",
                answer:
                  "For Premium members, meeting/demo requests are forwarded directly to the solution provider's panel. The process after this forwarding is the responsibility of the solution provider.",
              },
              {
                question: "Which membership is right for me?",
                answer:
                  "Free for brand awareness, Pro for market visibility and content power, Premium for active sales referrals.",
              },
            ],
          },
          {
            title: "Membership & Corporate Packages",
            items: [
              {
                question:
                  "What is the difference between individual and corporate membership?",
                answer:
                  "Individual membership is for HR professionals. Corporate membership is for HRTech solution providers.",
              },
              {
                question: "How long are the memberships?",
                answer:
                  "6-month and 12-month plan options are offered. 12-month plans are more advantageous.",
              },
              {
                question: "Can I upgrade my membership?",
                answer:
                  "Yes. You can upgrade from Free → Pro → Premium at any time.",
              },
            ],
          },
        ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {language === "tr"
                ? "Sıkça Sorulan Sorular"
                : "Frequently Asked Questions"}
            </h1>
            <p className="text-muted-foreground mt-3">
              {language === "tr"
                ? "HRTera hakkında merak ettiğiniz her şey"
                : "Everything you want to know about HRTera"}
            </p>
          </header>

          <div className="space-y-10">
            {sections.map((section, sIdx) => (
              <section key={sIdx}>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  {section.title}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, qIdx) => (
                    <AccordionItem
                      key={qIdx}
                      value={`section-${sIdx}-item-${qIdx}`}
                    >
                      <AccordionTrigger className="text-left text-foreground hover:no-underline hover:text-primary">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-justify">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
