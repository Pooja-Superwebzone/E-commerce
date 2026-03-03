"use client";

import Link from "next/link";
import { useCart } from "@/components/context/CartContext";
import Button from "@/components/ui/Button";

export default function CartPageContent() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } =
    useCart();

  const tax = getTotalPrice() * 0.1;
  const delivery = getTotalPrice() > 50 ? 0 : 50;
  const totalAmount = getTotalPrice() + tax + delivery;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-6xl mb-4">🛒</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
            <p className="text-gray-600 text-lg mb-8">
              Add items to your cart to get started
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Cart ({getTotalItems()} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/96x96?text=${encodeURIComponent(item.name)}`;
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="grow">
                    <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 cursor-pointer">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{item.category}</p>

                    {/* Price */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        ₹{(item.price).toLocaleString("en-IN")}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{(item.originalPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition text-gray-700 font-semibold"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition text-gray-700 font-semibold"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price & Remove */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900 mb-2">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Save for Later / Continue Shopping */}
            <div className="flex gap-4">
              <Link href="/products" className="flex-1">
                <Button variant="secondary" size="md" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition font-semibold text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-6">PRICE DETAILS</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Price ({getTotalItems()} items)</span>
                  <span className="font-semibold">₹{getTotalPrice().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Discount</span>
                  <span className="font-semibold text-green-600">− ₹0</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Delivery Charges</span>
                  {delivery === 0 ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-semibold">₹{delivery}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Tax</span>
                  <span className="font-semibold">₹{tax.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-b">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Message */}
              {delivery === 0 && (
                <p className="text-sm text-green-600 font-semibold text-center">
                  ✓ Free Delivery on this order
                </p>
              )}

              {/* Checkout Button */}
              <Button variant="primary" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                Proceed to Checkout
              </Button>

              {/* Trust Badges */}
              <div className="pt-4 space-y-2 text-center text-xs text-gray-600">
                <div className="flex justify-center gap-2">
                  <span>🔒 Secure Checkout</span>
                  <span>•</span>
                  <span>✓ Verified Seller</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
