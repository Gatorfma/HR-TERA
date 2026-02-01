import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, Pencil } from "lucide-react";
import { adminCompanySections, AdminCompanySection } from "@/data/adminCompanySections";

const iconMap = {
  building: Building2,
  plus: Plus,
  edit: Pencil,
};

const SectionTile = ({ section }: { section: AdminCompanySection }) => {
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

const CompanySettingsLanding = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {adminCompanySections.map((section) => (
        <SectionTile key={section.id} section={section} />
      ))}
    </div>
  );
};

export default CompanySettingsLanding;
