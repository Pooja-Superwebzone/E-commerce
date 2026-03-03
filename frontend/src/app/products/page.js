import ProductGrid from "@/components/product/ProductGrid";
import { fetchProducts } from "@/lib/catalogApi";

export const metadata = {
    title: "Shop Products - ShopHub | Best Deals & Offers",
    description: "Browse our wide selection of premium products with best prices, fast delivery, and easy returns.",
};

export default async function ProductsPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const searchQuery =
        typeof resolvedSearchParams?.search === "string"
            ? resolvedSearchParams.search.trim()
            : "";
    const products = await fetchProducts({ search: searchQuery });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                        {searchQuery ? `Search Results: "${searchQuery}"` : "All Products"}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span>🏠</span>
                        <span>/</span>
                        <span>Products</span>
                        <span>({products.length} items)</span>
                    </div>
                    <p className="text-gray-600 text-lg mt-3 max-w-2xl">
                        {searchQuery
                            ? `We found results for "${searchQuery}". Use filters to refine your search.`
                            : "Discover our complete collection of premium products. Filter by category, price range, and ratings to find exactly what you're looking for."}
                    </p>
                </div>
                <ProductGrid products={products} searchQuery={searchQuery} />
            </div>
        </div>
    );
}
