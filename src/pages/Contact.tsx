import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const CONTACT_STORAGE_KEY = "hrhub_contact_messages";

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.email.trim() || !isValidEmail(formData.email.trim())) {
      toast({
        title: t("contact.invalidEmail"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: t("contact.messageRequired"),
        variant: "destructive",
      });
      return;
    }

    const stored = localStorage.getItem(CONTACT_STORAGE_KEY);
    const messages = stored ? JSON.parse(stored) : [];
    messages.push({
      ...formData,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(messages));

    setFormData({
      name: "",
      email: "",
      company: "",
      subject: "",
      message: "",
    });

    toast({
      title: t("contact.messageSaved"),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t("contact.title")}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {t("contact.description")}
            </p>
          </header>

          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-2xl p-8 space-y-5"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact.fullName")}</Label>
                  <Input
                    id="name"
                    placeholder={t("contact.fullNamePlaceholder")}
                    value={formData.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact.workEmail")}</Label>
                  <Input
                    id="email"
                    placeholder={t("contact.workEmailPlaceholder")}
                    value={formData.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">{t("contact.company")}</Label>
                  <Input
                    id="company"
                    placeholder={t("contact.companyPlaceholder")}
                    value={formData.company}
                    onChange={(event) => handleChange("company", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("contact.subject")}</Label>
                  <Input
                    id="subject"
                    placeholder={t("contact.subjectPlaceholder")}
                    value={formData.subject}
                    onChange={(event) => handleChange("subject", event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.message")}</Label>
                <Textarea
                  id="message"
                  placeholder={t("contact.messagePlaceholder")}
                  value={formData.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  className="min-h-[216px]"
                  required
                />
              </div>

              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t("contact.sendMessage")}
              </Button>
            </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
