import { ArrowUpRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getRecentBlogPosts } from "@/data/blog";
import { useLanguage } from "@/contexts/LanguageContext";

const BlogSection = () => {
  const { t } = useLanguage();
  const recentPosts = getRecentBlogPosts(2);

  if (recentPosts.length === 0) return null;

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
              {t("blog.title")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("blog.subtitle")}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full border-border text-foreground hover:bg-muted" 
            asChild
          >
            <Link to="/blog">
              {t("blog.viewAll")}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {recentPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="group block">
                <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="font-heading font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full text-muted-foreground">
                          <User className="w-8 h-8" />
                        </span>
                        <span className="text-sm text-foreground font-medium">
                          {post.author.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        {post.publishDate}
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

export default BlogSection;
