import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container max-w-4xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground mt-3">Effective date: January 1, 2025</p>
          </header>

          <section className="space-y-6 text-muted-foreground">
            <p>
              These Terms of Service ("Terms") govern your use of HRTera and related
              services (the "Service"). By accessing or using the Service, you agree
              to these Terms.
            </p>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">About HRTera</h2>
              <p>
                HRTera provides a marketplace-style directory of HR products and vendors.
                We offer informational listings and tools to help users discover solutions.
                HRTera is not a party to agreements between vendors and customers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Use of the Service</h2>
              <p>
                You agree to use the Service lawfully and not to misuse or interfere with
                its operation. You are responsible for the accuracy of information you submit.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Listings and Content</h2>
              <p>
                Listings, descriptions, and other content may be provided by vendors or by
                HRTera. We do not guarantee the accuracy, availability, or suitability of
                any listing. If you submit content, you grant HRTera a non-exclusive license
                to display it as part of the Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Third-Party Links</h2>
              <p>
                The Service may link to third-party sites. HRTera does not control these
                sites and is not responsible for their content, policies, or practices.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Disclaimers</h2>
              <p>
                The Service is provided "as is" without warranties of any kind. HRTera
                disclaims all warranties, including implied warranties of merchantability,
                fitness for a particular purpose, and non-infringement.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, HRTera will not be liable for any
                indirect, incidental, special, consequential, or punitive damages, or any
                loss of profits or revenues, arising from your use of the Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. If we make changes, we will
                update the effective date above.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">Contact</h2>
              <p>
                Questions about these Terms can be submitted through our{" "}
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

export default Terms;
