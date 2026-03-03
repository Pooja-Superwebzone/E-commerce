"use client";

import { useCart } from "@/components/context/CartContext";
import { useToast } from "@/components/context/ToastContext";
import { useWishlist } from "@/components/context/WishlistContext";

export default function ProductDetailsContent({
  product,
  hasOriginalPrice,
  discount,
}) {
  const winterJacketFallback =
    "https://images.unsplash.com/photo-1544441892-3bae50038fab?q=80&w=1200&auto=format&fit=crop";
  const genericFallback =
    "https://via.placeholder.com/700x700?text=Product+Image";
  const safeImage =
    product.name?.toLowerCase() === "winter jacket"
      ? product.image || winterJacketFallback
      : product.image || genericFallback;

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product).then((added) => {
      if (added) {
        addToast(`${product.name} added to cart!`, "success");
      }
    });
  };

  const handleWishlist = () => {
    if (isSaved) {
      removeFromWishlist(product.id);
      addToast("Removed from wishlist", "success");
      return;
    }
    addToWishlist(product);
    addToast("Added to wishlist", "success");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={safeImage}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src =
                    product.name?.toLowerCase() === "winter jacket"
                      ? winterJacketFallback
                      : genericFallback;
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-lg transition"
              >
                Add to Cart
              </button>
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 rounded-lg border transition flex items-center justify-center ${
                  isSaved
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500"
                }`}
                aria-label="Toggle wishlist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isSaved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M12 21s-7.5-4.5-9.5-8.5A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7.5C19.5 16.5 12 21 12 21z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              {product.category}
              {product.subcategory ? ` / ${product.subcategory}` : ""}
            </p>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">{product.description}</p>

            <div className="flex items-center gap-2 text-sm">
              <span className="bg-green-600 text-white px-2 py-0.5 rounded font-semibold">
                {product.rating} {"\u2605"}
              </span>
              <span className="text-gray-500">({product.reviews} reviews)</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {"\u20B9"}
                {product.price.toLocaleString("en-IN")}
              </span>
              {hasOriginalPrice && (
                <span className="text-gray-400 line-through text-xl">
                  {"\u20B9"}
                  {product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-semibold text-red-600">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900">Product Details</p>
              {product.brand && (
                <p className="text-sm text-gray-600">
                  Brand: <span className="capitalize">{product.brand}</span>
                </p>
              )}
              {product.sku && (
                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              )}
              {product.hsnCode && (
                <p className="text-sm text-gray-600">HSN: {product.hsnCode}</p>
              )}
              <p className="text-sm text-gray-600">
                Category: <span className="capitalize">{product.category}</span>
              </p>
              <p className="text-sm text-gray-600">
                Subcategory:{" "}
                <span className="capitalize">{product.subcategory || "General"}</span>
              </p>
              <p className="text-sm text-gray-600">
                GST: {Number(product.gstPercent || 0)}%
              </p>
              <p className="text-sm text-gray-600">
                Stock: {Number(product.stock || 0) > 0 ? `${Number(product.stock || 0)} available` : "Out of stock"}
              </p>
              <p className="text-sm text-gray-600">Delivery: FREE in 2-3 days</p>
              <p className="text-sm text-gray-600">Return Policy: 30-day easy returns</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Customer Reviews</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{product.rating}</span>
                <span className="text-yellow-500 text-lg">{"\u2605\u2605\u2605\u2605\u2605"}</span>
                <span className="text-sm text-gray-500">({product.reviews} ratings)</span>
              </div>
              <p className="text-sm text-gray-600">
                Great quality and value for money. Product matched the description.
              </p>
              <p className="text-sm text-gray-600">
                Fast delivery and packaging was good. Recommended purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
