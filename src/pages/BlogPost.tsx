import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Tag, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, getRelatedPosts } from "@/data/blog";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPostBySlug(slug || "");
  const relatedPosts = getRelatedPosts(slug || "", 3);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
            Post Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The blog post you are looking for does not exist.
          </p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Simple markdown-like rendering for content
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      // Header
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">
            {line.replace("## ", "")}
          </h2>
        );
        continue;
      }

      // Image
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        elements.push(
          <div key={`img-${i}`} className="my-8 flex justify-center">
            <img
              src={imgMatch[2]}
              alt={imgMatch[1]}
              className="w-1/2 h-auto rounded-xl border border-border"
            />
          </div>
        );
        continue;
      }

      // List
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().substring(2));
          i++;
        }
        i--; // Step back
        elements.push(
          <ul key={`list-${i}`} className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx}>
                {parseInline(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-muted-foreground leading-relaxed mb-4">
          {parseInline(line)}
        </p>
      );
    }
    return elements;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Back Button */}
      <div className="container pt-24 pb-4">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
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
              <Calendar className="w-4 h-4" />
              <span>{post.publishDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden mb-10 flex justify-center"
        >
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-1/2 h-auto rounded-2xl"
          />
        </motion.div>

        {/* Author Card (no avatar; icon instead) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 mb-10"
        >
          <div className="flex items-start gap-4">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full text-muted-foreground">
              <User className="w-7 h-7" />
            </span>

            <div>
              <h3 className="font-heading font-bold text-foreground text-lg">
                {post.author.name}
              </h3>
              <p className="text-primary text-sm font-medium mb-2">
                {post.author.role}
              </p>
              <p className="text-muted-foreground text-sm">{post.author.bio}</p>
            </div>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none"
        >
          {renderContent(post.content)}
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8">
              Related Articles
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
                  <Link to={`/blog/${relatedPost.slug}`} className="group block">
                    <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={relatedPost.thumbnail}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-5">
                        <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                          {relatedPost.category}
                        </span>

                        <h3 className="font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>

                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Calendar className="w-3 h-3" />
                          {relatedPost.publishDate}
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

export default BlogPost;
