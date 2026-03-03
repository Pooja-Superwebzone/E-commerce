"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  searchQuery = "",
  showSidebar = true,
  initialCategory = "All",
}) {
  const router = useRouter();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState(5000);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((item) => item.category))).map(
      (category) => category.charAt(0).toUpperCase() + category.slice(1)
    ),
  ];

  const sortProducts = (items, value) => {
    const sorted = [...items];

    switch (value) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    
    setFilteredProducts(sorted);
  };

  const filterProducts = (category, maxPrice) => {
    let filtered = products;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (category !== "All") {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    filtered = filtered.filter((p) => p.price <= maxPrice);
    sortProducts(filtered, sortBy);
  };

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (!showSidebar) {
      setFilteredProducts(products);
      return;
    }
    filterProducts(selectedCategory, priceRange);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, showSidebar]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      router.push("/products");
      return;
    }
    router.push(`/category/${category.toLowerCase()}`);
  };

  const handleSort = (e) => {
    const value = e.target.value;
    setSortBy(value);
    sortProducts(filteredProducts, value);
  };

  const handlePriceChange = (price) => {
    setPriceRange(price);
    filterProducts(selectedCategory, price);
  };

  if (!showSidebar) {
    return filteredProducts.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    ) : (
      <div className="bg-white border border-gray-200 rounded-xl p-20 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Products Found
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <aside className="lg:col-span-1">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-8 sticky top-24">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Category
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Price Range
            </h3>
            <input
              type="range"
              min="0"
              max="5000"
              value={priceRange}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-sm mt-3 text-gray-600 font-medium">
              <span>Rs 0</span>
              <span className="text-blue-600">Rs {priceRange.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Customer Rating
            </h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  className="w-full flex items-center gap-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="text-green-600 font-semibold">{"\u2605"}</span>
                  <span>{rating}+ Stars</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Discount
            </h3>
            <div className="space-y-2">
              {["50% or more", "30% or more", "Under 30%"].map((discount) => (
                <button
                  key={discount}
                  className="w-full text-left py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  {discount}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="lg:col-span-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Showing Results
            <span className="text-gray-500 font-normal ml-2">
              ({filteredProducts.length} items)
            </span>
          </h2>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sort By:
            </label>

            <div className="relative">
              <select
                value={sortBy}
                onChange={handleSort}
                className="appearance-none bg-white text-gray-900 border border-gray-300 px-4 pr-10 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="featured">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-20 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
