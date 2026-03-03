import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { fetchProducts } from "@/lib/catalogApi";

export default async function SubCategoryPage({ params }) {
  const { category, subcategory } = await params;

  const filteredProducts = await fetchProducts({
    category: category.toLowerCase(),
    subcategory: subcategory.toLowerCase(),
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href={`/category/${category}`} className="hover:text-blue-600">
            {category}
          </Link>
          <span>/</span>
          <span className="capitalize">{subcategory}</span>
        </div>
        <h1 className="text-2xl font-bold capitalize">
          {category} - {subcategory}
        </h1>
      </div>

      <ProductGrid
        products={filteredProducts}
        initialCategory={category.charAt(0).toUpperCase() + category.slice(1)}
      />
    </div>
  );
}
