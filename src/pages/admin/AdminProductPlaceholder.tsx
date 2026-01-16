import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminProductSections } from "@/data/adminProductSections";

const AdminProductPlaceholder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Find the matching section based on current path
  const currentSection = adminProductSections.find(
    (section) => section.path === location.pathname
  );

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
            onClick={() => navigate("/admin/products")}
            className="hover:text-foreground transition-colors"
          >
            Ürün Ayarları
          </button>
          <span>/</span>
          <span className="text-foreground">{currentSection?.title || "Sayfa"}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/products")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {currentSection?.title || "Sayfa"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {currentSection?.description}
          </p>
        </div>

        {/* Placeholder Content */}
        <Card className="max-w-2xl">
          <CardContent className="p-12 text-center">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Bu sayfa yakında yapılandırılacak
            </h2>
            <p className="text-muted-foreground">
              Bu bölüm henüz geliştirme aşamasındadır. Lütfen daha sonra tekrar kontrol edin.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProductPlaceholder;
