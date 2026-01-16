import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Box, Plus, Tag, Inbox, Layers, BarChart3, Table2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTabs from "@/components/admin/AdminTabs";
import { adminProductSections, AdminProductSection } from "@/data/adminProductSections";

const iconMap = {
  cube: Box,
  plus: Plus,
  tag: Tag,
  inbox: Inbox,
  layers: Layers,
  chart: BarChart3,
  table: Table2,
};

const SectionTile = ({ section }: { section: AdminProductSection }) => {
  const navigate = useNavigate();
  const IconComponent = iconMap[section.icon];

  return (
    <Card
      onClick={() => navigate(section.path)}
      className="cursor-pointer group hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      <CardContent className="p-6 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {section.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {section.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminProducts = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Paneli</h1>
        
        <div className="space-y-6">
          <AdminTabs activeTab="products" />

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminProductSections.map((section) => (
              <SectionTile key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
