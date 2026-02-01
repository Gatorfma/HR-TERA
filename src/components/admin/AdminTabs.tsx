import { useNavigate } from "react-router-dom";

type AdminTabValue = "analytics" | "users" | "products";

interface AdminTabsProps {
  activeTab: AdminTabValue;
}

const AdminTabs = ({ activeTab }: AdminTabsProps) => {
  const navigate = useNavigate();

  const tabs: { value: AdminTabValue; label: string; path: string }[] = [
    { value: "analytics", label: "Analitik", path: "/admin" },
    { value: "users", label: "Şirket Ayarları", path: "/admin?tab=users" },
    { value: "products", label: "Çözüm Ayarları", path: "/admin/products" },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    navigate(tab.path);
  };

  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTabClick(tab)}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
            activeTab === tab.value
              ? "bg-background text-foreground shadow-sm"
              : "hover:bg-background/50 hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminTabs;
