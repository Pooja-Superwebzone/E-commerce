"use client";

import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { useEffect, useState } from "react";
import { fetchCategories, fetchProducts } from "@/lib/catalogApi";

const slides = [
  {
    id: 1,
    title: "Mega Electronics Sale",
    subtitle: "Up to 50% off on smartphones & gadgets",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2000",
  },
  {
    id: 2,
    title: "New Fashion Collection",
    subtitle: "Trending styles for every season",
    image:
      "https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=2000",
  },
  {
    id: 3,
    title: "Home & Living Essentials",
    subtitle: "Upgrade your space with modern designs",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2000",
  },
];

export default function HomePageContent() {
  const [current, setCurrent] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryMenu, setCategoryMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    null
  );
  const [brokenCategoryImages, setBrokenCategoryImages] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts({ featured: true, limit: 8 }),
        fetchCategories(),
      ]);

      setFeaturedProducts(productsData || []);
      setCategoryMenu(categoriesData.menu || []);
      setSelectedCategory((categoriesData.menu || [])[0] || null);
    };

    loadHomeData();
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="relative h-[90vh] w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"
              }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/60 flex items-center">
              <div className="max-w-7xl mx-auto px-6 text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl mb-6 text-gray-200">
                  {slide.subtitle}
                </p>

                <Link href="/products">
                  <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold">
                    Shop Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/30 p-3 rounded-full"
        >
          {"<"}
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/30 p-3 rounded-full"
        >
          {">"}
        </button>
      </section>

      <section className="bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 7h13v10H3z" />
                  <path d="M16 10h3l2 3v4h-5z" />
                  <circle cx="7.5" cy="18.5" r="1.5" />
                  <circle cx="17.5" cy="18.5" r="1.5" />
                </svg>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-900">
                  Free Delivery
                </h4>
                <p className="text-xs text-gray-500">On orders above Rs500</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-900">
                  Secure Payment
                </h4>
                <p className="text-xs text-gray-500">100% protected payments</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 14l-4-4 4-4" />
                  <path d="M5 10h10a4 4 0 110 8h-1" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Easy Returns
                </h4>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M18 10a6 6 0 10-12 0v4a2 2 0 002 2h1" />
                  <path d="M15 16h1a2 2 0 002-2v-4" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  24/7 Support
                </h4>
                <p className="text-xs text-gray-500">Dedicated support team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                Trending Now
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="text-gray-600 mt-3 max-w-xl">
                Discover our most popular and top-rated products. Carefully
                selected for quality and value.
              </p>
            </div>

            <Link href="/products">
              <button className="hidden md:inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
                View All
              </button>
            </Link>
          </div>

          <ProductGrid products={featuredProducts} showSidebar={false} />

          <div className="mt-10 text-center md:hidden">
            <Link href="/products">
              <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
                View All Products
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {categoryMenu.slice(0, 12).map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex flex-col items-center text-center py-4 rounded-lg transition ${selectedCategory?.name === category.name
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  <div className="w-14 h-14 rounded-full bg-cyan-100 overflow-hidden flex items-center justify-center text-2xl mb-2">
                    {category.image && !brokenCategoryImages[category.name] ? (
                      <img
                        src={category.image}
                        alt={category.label}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setBrokenCategoryImages((prev) => ({
                            ...prev,
                            [category.name]: true,
                          }))
                        }
                      />
                    ) : (
                      category.icon || category.label.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <p className="text-xs md:text-sm font-medium text-gray-800">
                    {category.label}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                {selectedCategory && (
                  <>
                    <p className="text-sm font-semibold text-gray-700">
                      {selectedCategory.label} subcategories:
                    </p>
                    {selectedCategory.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.name}
                        href={`/category/${selectedCategory.name}/${subcategory.name}`}
                        className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition"
                      >
                        {subcategory.label}
                      </Link>
                    ))}
                    <Link
                      href={`/category/${selectedCategory.name}`}
                      className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      View all {selectedCategory.label}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>

        <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
          <p className="uppercase tracking-widest text-sm font-semibold text-blue-200 mb-4">
            Stay Updated
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Get exclusive deals, early access to new arrivals, and special
            discounts delivered straight to your inbox.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 w-full px-5 py-3 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 transition placeholder-gray-500 font-medium"
            />

            <button className="w-full sm:w-auto bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-gray-100 hover:scale-105 transition-all duration-200">
              Subscribe
            </button>
          </div>

          <p className="text-xs text-blue-200 mt-6">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}



