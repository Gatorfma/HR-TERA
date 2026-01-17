export interface AdminProductSection {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: "cube" | "plus" | "tag" | "inbox" | "layers" | "chart" | "table";
}

export const adminProductSections: AdminProductSection[] = [
  {
    id: "product-editing",
    title: "Çözüm Düzenleme",
    description: "Mevcut çözümleri arayıp güncelleyin.",
    path: "/admin/products/edit",
    icon: "cube",
  },
  {
    id: "product-create",
    title: "Yeni Çözüm Oluştur",
    description: "Çözümü hızlıca ekleyin veya güncelleyin.",
    path: "/admin/products/new",
    icon: "plus",
  },
  {
    id: "requests",
    title: "Talepler",
    description: "Listeleme ve sahiplik isteklerini yönetin.",
    path: "/admin/products/requests",
    icon: "inbox",
  },
  {
    id: "tier-pricing",
    title: "Tier Fiyatları",
    description: "Freemium/Silver/Gold fiyatlarını güncelleyin.",
    path: "/admin/products/tiers",
    icon: "layers",
  },
  {
    id: "product-analytics",
    title: "Çözüm Analitiği",
    description: "Ziyaret ve rating performansını inceleyin.",
    path: "/admin/products/analytics",
    icon: "chart",
  },
  {
    id: "bulk-upload",
    title: "Excel ile Toplu Ekle",
    description: "Excel dosyasından birden fazla çözüm ekleyin.",
    path: "/admin/products/bulk-upload",
    icon: "table",
  },
];
