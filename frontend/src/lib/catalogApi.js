import { apiUrl } from "@/lib/api";

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const response = await fetch(apiUrl(`/products${query.toString() ? `?${query.toString()}` : ""}`), {
    cache: "no-store",
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data?.data?.items || data?.items || [];
}

export async function fetchProductById(id) {
  const response = await fetch(apiUrl(`/products/${id}`), { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.data?.item || data?.item || null;
}

export async function fetchCategories() {
  const response = await fetch(apiUrl("/categories"), { cache: "no-store" });
  if (!response.ok) {
    return { menu: [], categories: ["All"] };
  }
  const data = await response.json();
  if (data?.data) return data.data;
  return data;
}
