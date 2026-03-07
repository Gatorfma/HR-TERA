import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface DemoRequestSectionProps {
  productName: string;
}

const DemoRequestSection = ({ productName }: DemoRequestSectionProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: t("demo.submitted"),
      description: t("demo.submittedDesc"),
    });

    setFormData({ name: "", email: "", company: "", role: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl border border-primary/20 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Play className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground">
              {t("demo.requestTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("demo.seeInAction").replace("{productName}", productName)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder={t("demo.yourName")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-background"
            />
            <Input
              type="email"
              placeholder={t("demo.workEmail")}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-background"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder={t("demo.company")}
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
              className="bg-background"
            />
            <Input
              placeholder={t("demo.yourRole")}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="bg-background"
            />
          </div>
          <Textarea
            placeholder={t("demo.needsOptional")}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            className="bg-background resize-none"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            {isSubmitting ? (
              t("demo.submitting")
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t("demo.requestDemo")}
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default DemoRequestSection;
