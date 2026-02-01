import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Story = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Hikayemiz...
            </h1>
          </header>

					<section className="space-y-6 text-muted-foreground">
						<p>
							Her şey 2000 yılında başladı…
						</p>

						<p>
							O dönem e-postalarla üye olabildiğiniz groups’lar vardı. Ben de YahooGroups’ta{" "}
							<strong>“RecruitmenTurkey”</strong>{" "}
							adlı bir grup kurdum. Bana yakın arkadaşlarım “Arti” dedikleri için, R ve T
							harflerinden uydurdum RecruitmenTurkey adını. Sadece insan kaynakları
							içeriklerinin paylaşıldığı bu grup, en yoğun döneminde,{" "}
							<strong>yaklaşık 23.000 üyesiyle</strong>, aylık 1500 e-postalık bir iletişim
							platformu halinde geldi. Biraz eski İKcıların çoğu hatırlar bu adı.
						</p>

						<p>
							Neredeyse eş zamanlı{" "}
							<strong>recruitmenturkey.com</strong>’u kurdum. İlk İK blog içeriğini burada
							oluşturdum. İş arayanlara yardımcı olma amacıyla, o dönem için faaliyette
							olan danışmanlık firmaları, şirketlerin kurumsal İK e-posta ve faks
							bilgilerini paylaştım. Evet, faks numarası bilgilerini :)
						</p>

						<p>
							<em>
								Siteyi yapan{" "}
								<strong><em>Devrim Aydoğdu</em></strong>’ya buradan tekrar teşekkür ederim.
							</em>
						</p>

						<p>
							Ne yazık ki 2020 sonunda tamamen kapatıldı YahooGroups ve RecruitmenTurkey’in
							bu mecradaki hikayesi bitti.
						</p>

						<p>
							Site ve e-topluluk büyüdükçe, İKcılara yönelik bir pazaryeri fikri geldi
							aklıma. Amacım, İK’da satın alınan tüm hizmet ve çözümleri tanıtmaktı. 2 kez
							bunu denedim. 2004-2006 yıllarında, o dönemki internet kullanım oranlarına
							göre fena da değildi ama ilerlemedi.
						</p>

						<p>
							Daha sonraki yıllarda farklı girişimlerim oldu, farklı girişimlerde yer
							aldım. Chatbotu İK’da ilk ben görüştüm büyük firmalarla. İş görüşmelerinde
							adayın yüz ifadelerini analiz eden, İK Analitiğinde çözüm geliştiren çözümlere
							bulaştım.
						</p>

						<p>
							<em>
								1991 yılında, hazırlık sınıfında tanıştığım, fikirsel desteğini hiç
								esirgemeyen İTÜ Endüstri’den sınıf arkadaşım{" "}
								<strong><em>Doğan</em></strong>’a buradan tekrar teşekkür ederim.
							</em>
						</p>

						<p>
							Çalışan Deneyimi ve Çalışan Bağlılığı odağında İKcı meslektaşlarımla da
							görüşmelerde, özellikle teknoloji tarafında gereksinimleri, son 10 yılda
							daha fazla konuşmaya başladık. Bu alanda da bizzat tanıdığım, güvendiğim iş
							ortaklarıyla, İK’nın dijitalleşmesine giden adımların atılmasına yardımcı
							oldum.
						</p>

						<p>
							Ve artık İnsan Kaynakları alanındaki tüm teknolojik çözüm sunanları sizlere
							tanıtıyorum.
						</p>

						<p>
							<strong>Karşınızda HRTera.co …</strong>
						</p>

						<p>
							<strong>
								İKcı meslektaşlarımı, satınalmacıları, tüm üst yönetimi ve sektöre
								teknolojik çözüm sunan tüm iş ortaklarımı, birlikte büyütmeye davet
								ediyorum.
							</strong>
						</p>
					</section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Story;
