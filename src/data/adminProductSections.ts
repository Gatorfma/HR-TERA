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
    title: "Ürün Düzenleme",
    description: "Mevcut ürünleri arayıp güncelleyin.",
    path: "/admin/products/edit",
    icon: "cube",
  },
  {
    id: "product-create",
    title: "Yeni Ürün Oluştur",
    description: "Ürünü hızlıca ekleyin veya güncelleyin.",
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
    description: "Freemium/Plus/Premium fiyatlarını güncelleyin.",
    path: "/admin/products/tiers",
    icon: "layers",
  },
  {
    id: "product-analytics",
    title: "Ürün Analitiği",
    description: "Ziyaret ve rating performansını inceleyin.",
    path: "/admin/products/analytics",
    icon: "chart",
  },
  {
    id: "bulk-upload",
    title: "Excel ile Toplu Ekle",
    description: "Excel dosyasından birden fazla ürün ekleyin.",
    path: "/admin/products/bulk-upload",
    icon: "table",
  },
];
