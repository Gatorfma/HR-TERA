import { useState, useEffect } from "react";
import { ArrowUpRight, Calendar, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getNewsfeedPosts } from "@/api/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";
import LogoImage from "@/components/ui/logo-image";

type NewsfeedPost = {
  id: string;
  title: string;
  author: string;
  slug: string;
  image: string | null;
  tags: string[];
  category: string;
  created_at: string;
};

const NewsfeedSection = () => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<NewsfeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getNewsfeedPosts({ n: 2, page: 1 });
        setPosts(data);
      } catch (error) {
        console.error("Error fetching newsfeed posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t("newsfeed.title")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("newsfeed.subtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-border text-foreground hover:bg-muted"
            asChild
          >
            <Link to="/newsfeed">
              {t("newsfeed.viewAll")}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={`/newsfeed/${post.slug}`} className="group block">
                <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border">
                  <LogoImage
                    variant="card"
                    src={post.image || ""}
                    alt={post.title}
                    hoverZoom
                    fallbackText={post.title}
                    className="aspect-[16/9]"
                  />
                  <div className="p-6">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="font-heading font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground font-medium">
                          {post.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsfeedSection;
