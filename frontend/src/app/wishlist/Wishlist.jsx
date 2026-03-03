"use client";

import { useWishlist } from "@/components/context/WishlistContext";
import ProductCard from "@/components/product/ProductCard";

export default function Wishlist() {
  const { wishlistItems } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">
        My Wishlist
      </h1>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
          <p className="text-xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </p>
          <p className="text-gray-600">
            Save items to see them here.
          </p>
        </div>
      )}
    </div>
  );
}