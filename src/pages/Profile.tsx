import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Package, Settings, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileHero from "@/components/profile/ProfileHero";
import MyProductsTab from "@/components/profile/MyProductsTab";
import ProductApplicationsTab from "@/components/profile/ProductApplicationsTab";
import SettingsTab from "@/components/profile/SettingsTab";
import { useAuth } from "@/contexts/AuthContext";

type ProfileTab = "products" | "applications" | "settings";

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    (searchParams.get("tab") as ProfileTab) || "products"
  );

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get("tab") as ProfileTab;
    if (tabParam && (tabParam === "products" || tabParam === "applications" || tabParam === "settings")) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: "products" as ProfileTab, label: "Çözümlerim", icon: <Package className="w-4 h-4" /> },
    { id: "applications" as ProfileTab, label: "Çözüm Başvuruları", icon: <FileText className="w-4 h-4" /> },
    { id: "settings" as ProfileTab, label: "Ayarlar", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero */}
          <ProfileHero />

          {/* Tabs */}
          <div className="mt-8 border-b border-border">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "products" && <MyProductsTab />}
            {activeTab === "applications" && <ProductApplicationsTab />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
