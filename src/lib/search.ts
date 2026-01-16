import { products, Product } from "@/data/products";
import { vendors, Vendor } from "@/data/vendors";

export interface SearchResults {
  products: Product[];
  vendors: Vendor[];
}

export const searchAll = (query: string): SearchResults => {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return { products: [], vendors: [] };
  }

  const matchedProducts = products.filter(product => 
    product.name.toLowerCase().includes(normalizedQuery) ||
    product.category.toLowerCase().includes(normalizedQuery) ||
    product.description.toLowerCase().includes(normalizedQuery)
  );

  const matchedVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(normalizedQuery) ||
    vendor.category.toLowerCase().includes(normalizedQuery) ||
    vendor.description.toLowerCase().includes(normalizedQuery)
  );

  return { products: matchedProducts, vendors: matchedVendors };
};
