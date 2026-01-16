import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground mt-3">Effective date: January 1, 2025</p>
          </header>

          <section className="space-y-6 text-muted-foreground">
            <p>
              This Privacy Policy describes how HRHub handles information in the Service.
              We aim to collect the minimum necessary data and to be transparent about
              how information is used.
            </p>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                Information You Provide
              </h2>
              <p>
                When you submit forms (such as contact or newsletter signup), the information
                you enter is stored in your browser so you can revisit it later. We do not
                transmit that information to third-party services from the client by default.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                Browser Storage
              </h2>
              <p>
                We use local browser storage to keep session and preference data (for example,
                demo profile details) so your experience persists between visits. You can clear
                this data at any time from your browser settings.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                Product Catalog Data
              </h2>
              <p>
                HRHub retrieves product listings from its database provider to display content.
                These requests are limited to catalog data and do not include personal data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                How We Use Information
              </h2>
              <p>
                Information is used to operate the Service, display content you request,
                and improve the user experience. We do not sell personal data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                Data Retention
              </h2>
              <p>
                Form submissions and demo session data remain in your browser until you clear
                them. If you want to remove stored data, use your browser's site data controls.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                Your Choices
              </h2>
              <p>
                You can use the Service without submitting personal information. If you do
                submit a form and later want it removed, clear your browser's stored data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                Contact
              </h2>
              <p>
                For privacy questions, please use our{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  contact page
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
