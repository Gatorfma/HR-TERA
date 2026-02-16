export interface AdminCompanySection {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: "building" | "plus" | "edit" | "table";
}

export const adminCompanySections: AdminCompanySection[] = [
  {
    id: "company-editing",
    title: "Şirket Düzenleme",
    description: "Mevcut şirketleri arayıp güncelleyin.",
    path: "/admin/companies/edit",
    icon: "edit",
  },
  {
    id: "company-create",
    title: "Yeni Şirket Oluştur",
    description: "Yeni bir şirket (vendor) kaydı oluşturun.",
    path: "/admin/companies/new",
    icon: "plus",
  },
  {
    id: "bulk-upload",
    title: "Excel ile Toplu Ekle",
    description: "Excel dosyasından birden fazla şirket ekleyin.",
    path: "/admin/companies/bulk-upload",
    icon: "table",
  },
];
