import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { fetchProducts } from "@/lib/catalogApi";

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const filteredProducts = await fetchProducts({ category: category.toLowerCase() });
  const subcategories = [
    ...new Set(
      filteredProducts
        .map((product) => product.subcategory)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8 capitalize text-white">{category}</h1>

      {subcategories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory}
              href={`/category/${category}/${subcategory}`}
              className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition"
            >
              {subcategory}
            </Link>
          ))}
        </div>
      )}

      <ProductGrid
        products={filteredProducts}
        initialCategory={category.charAt(0).toUpperCase() + category.slice(1)}
      />
    </div>
  );
}

