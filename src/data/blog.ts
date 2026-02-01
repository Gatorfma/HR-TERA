export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    bio: string;
  };
  publishDate: string;
  readTime: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "yavrum-buyunce-ne-olacaksin-editor-teyzecim",
    title: "Yavrum Büyüyünce Ne Olacaksın Editör Teyzecim",
    excerpt: "Yavrum büyüyünce ne olacak bilmiyorum ama, ne olmayacağını çok iyi biliyorum; Editör.",
    content: `Belki 10 yıl belki 5 yıl sonra, çocuklara “Yavrum, büyünce ne olacaksın ?” diye sorulunca “Editor teyzecim” diyecek olacak mı acaba ?

Anthropic CEO’su Dario Amodei, **“yapay zeka modellerinin 6 ila 12 ay içinde yazılım mühendislerinin uçtan uca yaptığı işlerin ‘çoğunu, belki de tamamını’ yapabileceğini ve mühendislerin yerini editörlerin alacağını”** öngörüyor. Diyor son Davos zirvesinde.

Burada editör, tam doğru bir çeviri değil. Edit etmek, düzenlemek, düzeltmek gibi anlıyorum ben.

Peki düzeltmek, düzenlemek için ne bilmek gerekiyor ?

Konu ne ise onu bilmek gerekiyor.

Şu anki düzeyde konunun uzmanı olmadan editlemek mümkün değil.

Demek ki işlerimizi kaybetmek için son 1 yıl.

Bu konuya 2 veriyle son vereyim.

- İlki “yazılımcı iş ilanlarının” son 5 yılın en düşüğünde olması.

![Software Development Job Postings](https://www.artemizguler.com/piyano_media/2026/01/Yazilimci-Is-Ilanlari-300x281.png)

- Dario bunu geçen yıl da söylemiş. Yaklaşık 1500 yazılım mühendisi çalışıyor ve bilin bakalım aktif kaç ilanı var. 150 (Yüz elli)

**2027’de kimler işsiz kalacak göreceğiz.**

Not 1: Bu yazıyı ben yazdım.

Not 2: Görseli ise YZ tasarladı.`,
    thumbnail: "https://www.artemizguler.com/piyano_media/2026/01/ChatGPT-Image-21-Oca-2026-19_09_59.png",
    category: "Yapay Zeka",
    author: {
      name: "Artemiz Güler",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", // Placeholder valid avatar
      role: "Author",
      bio: "Artemiz Güler"
    },
    publishDate: "Jan 21, 2026",
    readTime: "5 min read",
    tags: ["ANTHROPIC", "ARTEMİZ GÜLER", "ÇALIŞAN BAĞLILIĞI", "ÇALIŞAN DENEYİMİ", "DARIO AMODEI", "EMPLOYEE ENGAGEMENT", "EMPLOYEE EXPERIENCE", "EX", "HUMAN RESOURCES", "İNSAN KAYNAKLARI", "YAPAY ZEKA"]
  },
  {
    id: "2",
    slug: "yapay-zeka-ile-ilgili-onermeler-saptamalar",
    title: "Yapay Zeka İle İlgili Önermeler, Saptamalar",
    excerpt: "Yapay zeka ile ilgili önemli saptamalar ve gelecek öngörüleri.",
    content: `Geçen hafta yapay zekanın, özellikle doğru promptun nasıl yazılması ile ilgili bir paylaşıma katıldım.
    
**Verdikleri örnek prompt:**

_You are an elite executive coach and organizational psychologist with 20+ years of experience coaching Fortune 500 leaders. You specialize in creating high- impact performance management tools that drive measurable behavior change and team excellence. Your Task Create a Monthly Reflection & Coaching Template that serves as the foundation for transformational 1:1 conversations between managers and their direct reports. This template will be used by senior leaders to elevate team performance and accelerate individual growth. Template Specifications Format Requirements • Length: Single page that fits in one scroll view (Confluence/Notion optimized) • Structure: Clean Markdown with strategic use of tables for assessment matrices • Completion: Include blank lines “| |” and empty table cells for user input • Header: Include explanatory blockquote (2-3 lines max) that sets context and expectations Core Architecture Design around these 6 essential sections (customizable based on user input): 1. 2. 3. Performance Snapshot – Current state assessment and energy check Wins & Achievements – Success celebration with impact analysis Behavioral Excellence – Values/behaviors assessment matrix (self vs. manager ratings) 4. Impact & Value Creation – Stakeholder value and contribution analysis 5. 6. Development Needs – Growth areas with actionable next steps Two-Way Feedback Exchange – Structured mutual feedback (employee to manager, manager to employee) Advanced Features to Include • Habit Formation Grid (Start/Stop/Continue framework) • Commitment Accountability Table (employee commits, manager commits, success metrics) • Rating Scales (1-5 where appropriate for quantitative tracking) • Future-Focus Elements (next month priorities, review dates, success metrics) Customization Inputs Process these variables and integrate seamlessly: • Core Values: {Insert specific values or default to “See company values”} • Expected Behaviors: {Insert specific behaviors or use examples like “Strategic Thinking, Proactive Communication, Customer Centricity, Innovation Mindset”} • Section Preferences: {Comma-separated list or use default 6 sections above} • Assessment Approach: Always include self-assessment vs. manager assessment comparison tables Quality Standards Your template must demonstrate: • Executive Sophistication: Language and structure appropriate for senior leadership conversations • Psychological Safety: Questions that encourage honest self-reflection and vulnerability • Action Orientation: Every section drives toward specific, measurable next steps • Relationship Building: Elements that strengthen manager-employee partnership • Performance Integration: Clear connections between individual growth and business impact Critical Success Factors • Brevity with Depth: Comprehensive coverage without overwhelming length • Visual Clarity: Strategic use of tables, headers, and white space for easy navigation • Completion Ease: Intuitive flow that guides users through reflection process • Coaching Conversation Catalyst: Designed to generate meaningful dialogue, not just form completion Output Instructions Return ONLY the finished template in Markdown format. No preamble, no explanation, no commentary. The template should be immediately usable by any senior leader for their next monthly 1:1 coaching session. Begin the template with appropriate month/year/name fields and the contextual blockquote, then proceed._

**Şimdi bu promptu Türkçe olarak kaç İK’cı yazabilir ülkemizde ?**

**Hadi ifade edemedi diyelim, bu içeriği kaç kişi tasarlayabilir, düşünebilir ?**

Demek ki laylaylom işler dışında, gerçek bir katma değeri yaratmak için hem bilgi hem de bunu doğru ifade edebilmek, doğru tanımlayabilmek, yazabilmek gerekiyor sevgili yapayzekaseverler.

Siz ne dersiniz ?`,
    thumbnail: "https://www.artemizguler.com/piyano_media/2025/06/Ekran-Resmi-2025-06-23-20.20.52.png",
    category: "Yapay Zeka",
    author: {
      name: "Artemiz Güler",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", // Placeholder valid avatar
      role: "Author",
      bio: "Artemiz Güler"
    },
    publishDate: "Feb 1, 2026",
    readTime: "5 min read",
    tags: ["ARTEMİZ GÜLER", "ÇALIŞAN BAĞLILIĞI", "ÇALIŞAN DENEYİMİ", "HUMAN RESOURCES", "İNSAN KAYNAKLARI", "PROMPT", "YAPAY ZEKA"]
  }
];

export const getRecentBlogPosts = (limit: number = 2): BlogPost[] => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
};

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, limit: number = 3): BlogPost[] => {
  const currentPost = getBlogPostBySlug(currentSlug);
  if (!currentPost) return blogPosts.slice(0, limit);

  // Prioritize same category, then other posts
  const sameCategory = blogPosts.filter(
    post => post.slug !== currentSlug && post.category === currentPost.category
  );
  const otherPosts = blogPosts.filter(
    post => post.slug !== currentSlug && post.category !== currentPost.category
  );

  return [...sameCategory, ...otherPosts].slice(0, limit);
};
