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
