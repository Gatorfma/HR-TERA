import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Tag, User, Loader2, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getNewsfeedPost, getNewsfeedPosts } from "@/api/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LogoImage from "@/components/ui/logo-image";

type NewsfeedPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  slug: string;
  image: string | null;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
};

// Helper function to sanitize truncated HTML by closing unclosed tags and adding "..." inline
const sanitizeTruncatedHtml = (html: string, addEllipsis: boolean = false): string => {
  // Create a temporary div to parse the HTML
  const div = document.createElement("div");
  div.innerHTML = html;

  if (addEllipsis) {
    // Find the last text node and insert "..." after it (inline)
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null);
    let lastTextNode: Text | null = null;
    while (walker.nextNode()) {
      lastTextNode = walker.currentNode as Text;
    }
    if (lastTextNode && lastTextNode.parentNode) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "text-muted-foreground";
      ellipsis.textContent = "...";
      // Insert the ellipsis right after the text node, inside the same parent
      lastTextNode.after(ellipsis);
    }
  }

  // The browser will automatically close any unclosed tags
  return div.innerHTML;
};

const NewsfeedPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<NewsfeedPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<NewsfeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContentTruncated, setIsContentTruncated] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getNewsfeedPost({ postSlug: slug });
        if (data) {
          setPost(data);

          // Content is truncated for unauthenticated users
          setIsContentTruncated(!isAuthenticated);

          // Fetch related posts from the same category
          const related = await getNewsfeedPosts({
            n: 3,
            page: 1,
            categoryFilter: data.category,
          });
          // Filter out the current post
          setRelatedPosts(related.filter((p: NewsfeedPost) => p.id !== data.id).slice(0, 3));
        } else {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, isAuthenticated]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Sanitize truncated HTML content to fix any broken tags and add "..." inline
  const sanitizedContent = useMemo(() => {
    if (!post?.content) return "";
    if (isContentTruncated) {
      return sanitizeTruncatedHtml(post.content, true);
    }
    return post.content;
  }, [post?.content, isContentTruncated]);

  const handleOpenAuthModal = () => {
    window.dispatchEvent(new Event("open-auth-modal"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-64">
        <Navbar />
        <div className="container py-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background pt-32">
        <Navbar />
        <div className="container py-32 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
            {t("newsfeed.postNotFound")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("newsfeed.postNotFoundDesc")}
          </p>
          <Button asChild>
            <Link to="/newsfeed">
              {t("newsfeed.backToRadar")}
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Back Button */}
      <div className="container pt-32 pb-4">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/newsfeed">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("newsfeed.backToRadar")}
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <article className="container max-w-4xl pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            {post.category}
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        {post.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden mb-10 flex justify-center"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-w-2xl h-auto rounded-2xl"
            />
          </motion.div>
        )}

        {/* Article Content - Rendered as HTML */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div
            className="newsfeed-content prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Gradient overlay and login prompt for truncated content */}
          {isContentTruncated && (
            <div className="relative">
              {/* Gradient fade effect */}
              <div className="absolute bottom-full left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

              {/* Login prompt card */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                      {t("newsfeed.loginToReadFull")}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {t("newsfeed.loginToReadFullDesc")}
                    </p>
                  </div>
                  <Button
                    onClick={handleOpenAuthModal}
                    className="mt-2"
                  >
                    {t("newsfeed.loginButton")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Custom styles for TipTap content */}
        <style>{`
          .newsfeed-content p {
            margin-bottom: 0.5em;
          }
          .newsfeed-content p:empty {
            min-height: 1em;
          }
          .newsfeed-content ul {
            list-style-type: disc;
            padding-left: 1.5em;
            margin: 1em 0;
          }
          .newsfeed-content ol {
            list-style-type: decimal;
            padding-left: 1.5em;
            margin: 1em 0;
          }
          .newsfeed-content li {
            margin: 0.5em 0;
          }
          .newsfeed-content li p {
            margin: 0;
            min-height: auto;
          }
          .newsfeed-content h1 {
            font-size: 2em;
            font-weight: 700;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .newsfeed-content h2 {
            font-size: 1.5em;
            font-weight: 600;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .newsfeed-content h3 {
            font-size: 1.25em;
            font-weight: 600;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .newsfeed-content blockquote {
            border-left: 4px solid hsl(var(--primary));
            padding-left: 1em;
            margin: 1em 0;
            font-style: italic;
            color: hsl(var(--muted-foreground));
          }
          .newsfeed-content pre {
            background-color: hsl(var(--muted));
            border-radius: 0.5em;
            padding: 1em;
            margin: 1em 0;
            overflow-x: auto;
          }
          .newsfeed-content code {
            background-color: hsl(var(--muted));
            padding: 0.2em 0.4em;
            border-radius: 0.25em;
            font-size: 0.9em;
          }
          .newsfeed-content pre code {
            background: none;
            padding: 0;
          }
          .newsfeed-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5em;
            margin: 1em auto;
          }
          .newsfeed-content p[style*="text-align: center"] {
            text-align: center;
          }
          .newsfeed-content p[style*="text-align: right"] {
            text-align: right;
          }
          .newsfeed-content p[style*="text-align: center"] img {
            margin-left: auto;
            margin-right: auto;
          }
          .newsfeed-content a {
            color: hsl(var(--primary));
            text-decoration: underline;
          }
          .newsfeed-content a:hover {
            opacity: 0.8;
          }
        `}</style>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 pt-8 border-t border-border"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8">
              {t("newsfeed.relatedPosts")}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link to={`/newsfeed/${relatedPost.slug}`} className="group block">
                    <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border">
                      <LogoImage
                        variant="card"
                        src={relatedPost.image || ""}
                        alt={relatedPost.title}
                        hoverZoom
                        fallbackText={relatedPost.title}
                      />

                      <div className="p-5">
                        <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                          {relatedPost.category}
                        </span>

                        <h3 className="font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>

                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Calendar className="w-3 h-3" />
                          {formatDate(relatedPost.created_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default NewsfeedPost;
