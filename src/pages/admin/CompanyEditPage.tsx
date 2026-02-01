import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import UserSettingsTab from "@/components/admin/UserSettingsTab";

const CompanyEditPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="hover:text-foreground transition-colors"
          >
            Admin Paneli
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/admin?tab=users")}
            className="hover:text-foreground transition-colors"
          >
            Şirket Ayarları
          </button>
          <span>/</span>
          <span className="text-foreground">Şirket Düzenleme</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin?tab=users")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Şirket Düzenleme</h1>
          <p className="text-muted-foreground mt-2">
            Mevcut şirketleri arayıp güncelleyin.
          </p>
        </div>

        {/* Content */}
        <UserSettingsTab />
      </div>
    </AdminLayout>
  );
};

export default CompanyEditPage;
