export interface AdminCompanySection {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: "building" | "plus" | "edit";
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
];
