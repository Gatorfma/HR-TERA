import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Story = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Hikayemiz…
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              25 yılda bir fikrin olgunlaşması ve HRTera.co’nun doğuşu.
            </p>
          </header>

          <section className="space-y-8 text-muted-foreground">
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
                2000: Bir topluluğun ilk tohumu
              </h2>
              <p className="mb-4">
                Her şey 2000 yılında başladı.
              </p>
              <p className="mb-4">
                O dönemde e-postalarla üye olabildiğiniz e-group’lar vardı. Ben de YahooGroups’ta{" "}
                <strong>“RecruitmenTurkey”</strong> adlı bir grup kurdum. Bana yakın arkadaşlarım
                “Arti” dedikleri için R ve T harflerinden uydurmuştum bu adı. Sadece insan
                kaynaklarının paylaşıldığı bu grup, en yoğun döneminde yaklaşık{" "}
                <strong>23.000 üyesiyle</strong> aylık 1.500 e-postalık bir iletişim platformuna
                dönüştü. Biraz eski İKcıların çoğu bu adı hatırlar.
              </p>
              <p className="mb-4">
                Neredeyse eş zamanlı olarak <strong>recruitmenturkey.com</strong>’u da kurdum.
                Türkiye’deki ilk İK blog içeriklerini burada oluşturdum. İş arayanlara yardımcı
                olmak için o dönemde faaliyette olan danışmanlık firmalarının ve şirketlerin
                kurumsal İK iletişim bilgilerini paylaştım. Evet, faks numarası dahil.
              </p>
              <p className="mb-4 italic">
                Siteyi hayata geçiren <strong>Devrim Aydoğdu</strong>’ya burada bir kez daha
                teşekkür ederim.
              </p>
              <p>
                Ne yazık ki 2020 sonunda YahooGroups tamamen kapandı ve RecruitmenTurkey’in
                bu mecradaki hikayesi sona erdi.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
                2004–2006: Pazaryeri fikrinin ilk denemesi
              </h2>
              <p className="mb-4">
                Site ve e-topluluk büyüdükçe, İKcılara yönelik bir pazaryeri fikri zihnimde
                şekillenmeye başladı. Amacım buydu: İK’da satın alınan tüm hizmet ve ürünleri
                tek bir çatı altında toplamak, karşılaştırmak, kolaylaştırmak.
              </p>
              <p>
                2004–2006 yıllarında ilk kez denedim bunu. O dönemin internet kullanım oranları
                düşünüldüğünde fena sayılmazdı, ama ilerletemedim. Zaman henüz gelmemişti.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
                Sonraki yıllar: Teknoloji, insan ve denemeler
              </h2>
              <p className="mb-4">
                Takip eden yıllarda farklı girişimler içinde yer aldım, farklı teknolojilere
                dokundum. Chatbotları İK’da ilk büyük firmalarla ben görüştüm. İş görüşmelerinde
                adayın yüz ifadelerini analiz eden sistemleri, İK analitiği çözümlerini yakından
                tanıdım; kimi zaman ürün geliştirme süreçlerinde bizzat yer aldım.
              </p>
              <p className="mb-4">
                Çalışan Deneyimi ve Çalışan Bağlılığı odağında meslektaşlarımla yaptığım her
                görüşmede teknoloji ihtiyacı giderek daha fazla öne çıkıyordu. Bu alanda
                güvendiğim iş ortaklarıyla, İK’nın dijital dönüşümüne giden adımların atılmasına
                katkı sağladım.
              </p>
              <p className="italic">
                1991’de hazırlık sınıfında başlayan arkadaşlığımız bugün de sürüyor. Tüm dijital
                projelerimde fikirsel desteğini hiç esirgemeyen İTÜ Endüstri’den sınıf arkadaşım{" "}
                <strong>Doğan</strong>’a tekrar teşekkür ederim.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
                2026: Zaman geldi.
              </h2>
              <p className="mb-4">
                25 yıl boyunca İK’nın içinde oldum. Yazılım seçerken çaresiz kalan
                meslektaşlarımı gördüm. Yüzlerce çözüm arasında kaybolup kalan satın alma
                süreçlerine tanıklık ettim. Doğru araçla karşılaşamadığı için dijital dönüşümde
                geride kalan ekipleri izledim.
              </p>
              <p className="mb-4">
                Bu fikri iki kez daha önce denedim. Şimdi altyapı hazır, ekosistem olgunlaştı,
                İK profesyonelleri gerçek bir karar merkezi istiyor.
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-foreground mb-4">
                Karşınızda HRTera.co —
              </p>
              <p className="mb-4">
                Türkiye’deki ve global İK teknoloji çözümlerini keşfedebileceğiniz,
                karşılaştırabileceğiniz ve en doğru kararı verebileceğiniz platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
                Birlikte büyüyelim.
              </h2>
              <p className="mb-6">
                <strong>
                  İKcı meslektaşlarımı, satın alma profesyonellerini, üst yönetimi ve sektöre
                  teknolojik çözüm sunan tüm iş ortaklarımı — birlikte büyümeye, birlikte
                  büyütmeye davet ediyorum.
                </strong>
              </p>
              <div className="pt-4 border-t border-border">
                <p className="text-sm">13 Mart 2026</p>
                <p className="font-semibold text-foreground">Artemiz Güler</p>
                <p className="text-sm">Kurucu, HRTera.co</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Story;
