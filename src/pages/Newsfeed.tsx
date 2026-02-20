import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getNewsfeedPosts } from "@/api/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";
import LogoImage from "@/components/ui/logo-image";

const POSTS_PER_PAGE = 12;

const CATEGORIES = [
  "Çözüm Güncellemeleri",
  "Haberler",
  "Makaleler",
  "Etkinlikler",
] as const;

type NewsfeedPost = {
  id: string;
  title: string;
  author: string;
  slug: string;
  image: string | null;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
};

const Newsfeed = () => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<NewsfeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (page: number, category: string | null) => {
    setIsLoading(true);
    try {
      const data = await getNewsfeedPosts({
        n: POSTS_PER_PAGE,
        page,
        categoryFilter: category,
      });
      setPosts(data);
      setHasMore(data.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage, selectedCategory);
  }, [currentPage, selectedCategory, fetchPosts]);

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const formatDateParts = (dateString: string) => {
    const date = new Date(dateString);
    const month = new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
      month: "short",
    }).format(date);
    const year = date.getFullYear();
    return { month, year };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              HRTech Radar
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("newsfeed.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className={`rounded-full ${selectedCategory === null
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-foreground hover:bg-muted"
                }`}
              onClick={() => handleCategoryChange(null)}
            >
              {t("newsfeed.allPosts")}
            </Button>

            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full ${selectedCategory === category
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border text-foreground hover:bg-muted"
                  }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t("newsfeed.noPosts")}
              </p>
            </div>
          ) : (
            <>
              <div className="max-w-6xl mx-auto space-y-6">
                {posts.map((post, index) => {
                  const { month, year } = formatDateParts(post.created_at);
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link to={`/newsfeed/${post.slug}`} className="group block mb-[-6px]">
                        <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
                          <div className="flex flex-col md:flex-row">
                            {/* Content - Left side */}
                            <div className="flex-1 p-6 md:pr-4">
                              {/* Date */}
                              <p className="text-sm text-muted-foreground mb-6">
                                {month} · {year}
                              </p>

                              {/* Author · Category */}
                              <p className="text-sm text-muted-foreground mb-3 ml-2">
                                {post.author}
                                <span className="mx-2">·</span>
                                <span className="text-primary font-medium">{post.category}</span>
                              </p>

                              {/* Title */}
                              <h3 className="max-w-2xl font-heading font-bold text-xl text-foreground mb-4 group-hover:text-primary transition-colors ml-2">
                                {post.title}
                              </h3>

                              {/* Tags */}
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 ml-2">
                                  {post.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Image - Right side */}
                            <div className="md:w-64 lg:w-72 flex-shrink-0">
                              <div className="h-full min-h-[160px] md:min-h-full">
                                <LogoImage
                                  variant="card"
                                  src={post.image || ""}
                                  alt={post.title}
                                  hoverZoom
                                  fallbackText={post.title}
                                  className="h-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-16">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-sm text-muted-foreground px-4">
                  {language === "tr" ? "Sayfa" : "Page"} {currentPage}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!hasMore || isLoading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Newsfeed;
