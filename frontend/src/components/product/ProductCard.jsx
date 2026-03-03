"use client";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { useCart } from "@/components/context/CartContext";
import { useToast } from "@/components/context/ToastContext";
import { useWishlist } from "@/components/context/WishlistContext";
export default function ProductCard({ product }) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isSaved = isInWishlist(product.id);
    const [imageError, setImageError] = useState(false);
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const discount = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
    );

    const handleAddToCart = async (e) => {
        e.preventDefault();
        const added = await addToCart(product);
        if (added) {
            addToast(`${product.name} added to cart!`, "success");
        }
    };
    const winterJacketFallback =
        "https://images.unsplash.com/photo-1544441892-3bae50038fab?q=80&w=800&auto=format&fit=crop";
    const genericFallback =
        "https://via.placeholder.com/300x300?text=Product+Image";
    const fallbackImage =
        product.name?.toLowerCase() === "winter jacket"
            ? winterJacketFallback
            : genericFallback;
    return (
        <div className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">

            {/* Image Section */}
            <a href={`/products/${product.id}`}>
                <div
                    className="relative bg-gray-50 overflow-hidden cursor-pointer"
                    style={{ aspectRatio: "1/1" }}
                >
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 z-10 flex gap-2">
                        {discount > 0 && (
                            <span className="bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                                {discount}% OFF
                            </span>
                        )}
                        {product.badge && (
                            <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                                {product.badge}
                            </span>
                        )}
                    </div>

                    {/* Product Image */}
                    <img
                        src={imageError ? fallbackImage : (product.image || fallbackImage)}
                        alt={product.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            </a>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">

                {/* Category */}
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                    {product.category}
                </p>

                {/* Name */}
                <a href={`/products/${product.id}`}>
                    <h3 className="mt-1 text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 transition">
                        {product.name}
                    </h3>
                </a>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                        ★ {product.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({product.reviews})
                    </span>
                </div>

                {/* Pricing */}
                <div className="mt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                            ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}
                    </div>
                </div>

                {/* Delivery */}
                <div className="mt-2 text-xs text-gray-500">
                    <span className="text-green-600 font-semibold">FREE</span> Delivery • 2-3 Days
                </div>

                {/* Buttons */}
                <div className="mt-auto pt-4 flex gap-3">

                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition shadow-sm"
                    >
                        Add to Cart
                    </button>

                    <button
                        onClick={() => {
                            if (isSaved) {
                                removeFromWishlist(product.id);
                                addToast("Removed from wishlist", "success");
                            } else {
                                addToWishlist(product);
                                addToast("Added to wishlist", "success");
                            }
                        }}
                        className={`flex-1 border text-sm font-semibold py-2.5 rounded-lg transition ${isSaved
                            ? "border-red-500 text-red-500"
                            : "border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500"
                            }`}
                    >
                        {isSaved ? "Remove" : "Wishlist"}
                    </button>

                </div>
            </div>
        </div>
    );
}
