import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import VendorCard from "@/components/VendorCard";
import { searchAll } from "@/lib/search";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  const results = useMemo(() => searchAll(query), [query]);
  const totalResults = results.products.length + results.vendors.length;

  return (
    <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="mb-12">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
                Search Results
              </h1>
              {query && (
                <p className="text-muted-foreground text-lg">
                  {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
                </p>
              )}
            </div>

            {!query && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  Enter a search term to find products and vendors.
                </p>
              </div>
            )}

            {query && totalResults === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-4">
                  No results found for "{query}"
                </p>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse our{" "}
                  <Link to="/#products" className="text-primary hover:underline">products</Link>
                  {" "}and{" "}
                  <Link to="/#vendors" className="text-primary hover:underline">vendors</Link>.
                </p>
              </div>
            )}

            {/* Products Section */}
            {results.products.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    Products ({results.products.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      slug={product.slug}
                      image={product.image}
                      category={product.category}
                      name={product.name}
                      description={product.description}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Vendors Section */}
            {results.vendors.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    Vendors ({results.vendors.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.vendors.map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      slug={vendor.slug}
                      image={vendor.image}
                      logo={vendor.logo}
                      category={vendor.category}
                      name={vendor.name}
                      addedDate={vendor.addedDate}
                      isPro={vendor.isPro}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default SearchResults;
