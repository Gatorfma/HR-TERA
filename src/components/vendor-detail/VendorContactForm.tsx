import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface VendorContactFormProps {
  vendorName: string;
  isPremium?: boolean;
}

const VendorContactForm = ({ vendorName, isPremium = false }: VendorContactFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message sent!",
        description: `Your inquiry has been sent to ${vendorName}. They typically respond within 24 hours.`,
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h2 className="text-xl font-heading font-bold text-foreground mb-2">
        {isPremium ? "Request a Proposal" : "Contact Vendor"}
      </h2>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Clock className="w-4 h-4" />
        <span>Typically responds within 24 hours</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              placeholder="Your name" 
              required 
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work Email *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@company.com" 
              required 
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input 
            id="company" 
            placeholder="Your company name" 
            required 
            className="rounded-lg"
          />
        </div>

        {isPremium && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <Input 
                  id="role" 
                  placeholder="e.g. HR Director" 
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-size">Company Size</Label>
                <Input 
                  id="company-size" 
                  placeholder="e.g. 100-500 employees" 
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Approximate Budget</Label>
                <Input 
                  id="budget" 
                  placeholder="e.g. $5,000-10,000" 
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Preferred Timeline</Label>
                <Input 
                  id="timeline" 
                  placeholder="e.g. Q1 2025" 
                  className="rounded-lg"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea 
            id="message" 
            placeholder="Tell us about your project or requirements..." 
            rows={4}
            required 
            className="rounded-lg resize-none"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full rounded-full bg-primary text-[#111827] hover:bg-primary/90 font-semibold"
          size="lg"
          disabled={isSubmitting}
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? "Sending..." : isPremium ? "Submit Request" : "Send Message"}
        </Button>
      </form>
    </motion.div>
  );
};

export default VendorContactForm;
