"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/context/CartContext";
import { useAuth } from "@/components/context/AuthContext";
import { useToast } from "@/components/context/ToastContext";
import Button from "@/components/ui/Button";

const initialCheckoutForm = {
  deliveryType: "home_delivery",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  landmark: "",
  locationNote: "",
  pickupPointName: "Main Pickup Point",
  pickupLocation: "Store Front Desk",
  pickupAddress: "",
  pickupCity: "",
  pickupState: "",
  pickupPostalCode: "",
  paymentMethod: "cash_on_delivery",
  notes: "",
};
const CHECKOUT_FORM_STORAGE_KEY = "shophub_checkout_form_v1";

function getValidSavedAddress(user) {
  const address = user?.savedAddress;
  if (!address || typeof address !== "object") return null;
  const required = ["fullName", "phone", "addressLine1", "city", "state", "postalCode"];
  const hasRequired = required.every((field) => String(address[field] || "").trim());
  return hasRequired ? address : null;
}

export default function CartPageContent() {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
    checkout,
  } = useCart();

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1;
  const delivery = subtotal > 50 ? 0 : 50;
  const totalAmount = subtotal + tax + delivery;
  const savedAddress = useMemo(() => getValidSavedAddress(user), [user]);
  const hasSavedAddress = Boolean(savedAddress);
  const compactAddressLine = useMemo(() => {
    const baseParts = [
      checkoutForm.addressLine1,
      checkoutForm.addressLine2,
      checkoutForm.city,
      checkoutForm.state,
      checkoutForm.postalCode,
    ]
      .map((part) => String(part || "").trim())
      .filter(Boolean);

    const country = String(checkoutForm.country || "").trim();
    const hasRealAddress = baseParts.length > 0;

    if (hasRealAddress && country) {
      return [...baseParts, country].join(", ");
    }
    if (hasRealAddress) {
      return baseParts.join(", ");
    }
    return String(checkoutForm.fullName || "").trim() || "Saved address";
  }, [
    checkoutForm.addressLine1,
    checkoutForm.addressLine2,
    checkoutForm.city,
    checkoutForm.state,
    checkoutForm.postalCode,
    checkoutForm.country,
    checkoutForm.fullName,
  ]);
  const fullAddressLines = useMemo(() => {
    const lines = [];
    const contact = [checkoutForm.fullName, checkoutForm.phone]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(", ");
    if (contact) lines.push(contact);

    const line1 = [checkoutForm.addressLine1, checkoutForm.addressLine2]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(", ");
    if (line1) lines.push(line1);

    const line2 = [checkoutForm.city, checkoutForm.state, checkoutForm.postalCode]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(", ");
    if (line2) lines.push(line2);

    const country = String(checkoutForm.country || "").trim();
    if (country && lines.length > 0) lines.push(country);

    return lines;
  }, [
    checkoutForm.fullName,
    checkoutForm.phone,
    checkoutForm.addressLine1,
    checkoutForm.addressLine2,
    checkoutForm.city,
    checkoutForm.state,
    checkoutForm.postalCode,
    checkoutForm.country,
  ]);

  const updateCheckoutField = (key, value) => {
    setCheckoutForm((prev) => ({ ...prev, [key]: value }));
  };

  const applySavedAddressToForm = () => {
    if (!savedAddress) return;
    setCheckoutForm((prev) => ({
      ...prev,
      ...savedAddress,
      country: String(savedAddress.country || prev.country || "India"),
    }));
  };

  useEffect(() => {
    if (!savedAddress) return;
    setCheckoutForm((prev) => ({ ...prev, ...savedAddress }));
  }, [savedAddress]);

  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") return;
      const dbSavedAddress = getValidSavedAddress(user);
      setCheckoutForm((prev) => ({
        ...prev,
        ...parsed,
        ...(dbSavedAddress || {}),
        fullName:
          dbSavedAddress?.fullName || parsed.fullName || user.name || prev.fullName,
      }));
    } catch {

    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(checkoutForm));
    } catch {

    }
  }, [checkoutForm, user]);

  const handleCheckout = async () => {
    if (isPlacingOrder) return;

    setIsPlacingOrder(true);
    try {
      const payload =
        checkoutForm.deliveryType === "home_delivery" && hasSavedAddress && !showAddressForm
          ? { ...checkoutForm, ...savedAddress }
          : checkoutForm;
      await checkout(payload);
      addToast("Order placed successfully.", "success");
      setShowAddressForm(false);
      setIsAddressExpanded(false);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-6xl mb-4">Cart</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Cart ({getTotalItems()} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
              >
                <div className="flex gap-4">
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

                  <div className="grow">
                    <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 cursor-pointer">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{item.category}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        Rs {Number(item.price).toLocaleString("en-IN")}
                      </span>
                      {item.originalPrice ? (
                        <span className="text-sm text-gray-500 line-through">
                          Rs {Number(item.originalPrice).toLocaleString("en-IN")}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition text-gray-700 font-semibold"
                      >
                        -
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

                    <div className="text-right">
                      <p className="font-bold text-gray-900 mb-2">
                        Rs {(item.price * item.quantity).toLocaleString("en-IN")}
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Price Details</h2>

              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Price ({getTotalItems()} items)</span>
                  <span className="font-semibold">Rs {subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Discount</span>
                  <span className="font-semibold text-green-600">- Rs 0</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Delivery Charges</span>
                  {delivery === 0 ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-semibold">Rs {delivery}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-sm">Tax</span>
                  <span className="font-semibold">
                    Rs{" "}
                    {tax.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">
                  Rs{" "}
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="rounded-lg border border-gray-200 p-3 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Delivery Type</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="home_delivery"
                      checked={checkoutForm.deliveryType === "home_delivery"}
                      onChange={(e) => updateCheckoutField("deliveryType", e.target.value)}
                    />
                    Home Delivery
                  </label>
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup_point"
                      checked={checkoutForm.deliveryType === "pickup_point"}
                      onChange={(e) => updateCheckoutField("deliveryType", e.target.value)}
                    />
                    Pickup Point
                  </label>
                </div>
              </div>

              {checkoutForm.deliveryType === "home_delivery" ? (
                <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <h3 className="text-sm font-bold text-gray-900">Address Details</h3>
                  {hasSavedAddress && !showAddressForm ? (
                    <div className="space-y-2 text-xs text-gray-700">
                      <button
                        type="button"
                        className="w-full rounded bg-gray-50 px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsAddressExpanded((prev) => !prev)}
                        title="Click to view full address"
                      >
                        <span className="font-semibold">Deliver to:</span>{" "}
                        <span>{compactAddressLine || "Saved address"}</span>
                      </button>
                      {isAddressExpanded ? (
                        <p className="rounded border border-gray-200 bg-white px-3 py-2 leading-5">
                          {fullAddressLines.map((line, index) => (
                            <span key={`${line}-${index}`}>
                              {line}
                              {index < fullAddressLines.length - 1 ? <br /> : null}
                            </span>
                          ))}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                        onClick={() => {
                          applySavedAddressToForm();
                          setShowAddressForm(true);
                        }}
                      >
                        Change Address
                      </button>
                    </div>
                  ) : (
                    <>
                      {hasSavedAddress ? (
                        <button
                          type="button"
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          onClick={() => {
                            applySavedAddressToForm();
                            setShowAddressForm(false);
                          }}
                        >
                          Use Saved Address
                        </button>
                      ) : null}
                      <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Full Name *" value={checkoutForm.fullName} onChange={(e) => updateCheckoutField("fullName", e.target.value)} />
                      <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Phone *" value={checkoutForm.phone} onChange={(e) => updateCheckoutField("phone", e.target.value)} />
                      <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Address Line 1 *" value={checkoutForm.addressLine1} onChange={(e) => updateCheckoutField("addressLine1", e.target.value)} />
                      <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Address Line 2" value={checkoutForm.addressLine2} onChange={(e) => updateCheckoutField("addressLine2", e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="City *" value={checkoutForm.city} onChange={(e) => updateCheckoutField("city", e.target.value)} />
                        <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="State *" value={checkoutForm.state} onChange={(e) => updateCheckoutField("state", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Postal Code *" value={checkoutForm.postalCode} onChange={(e) => updateCheckoutField("postalCode", e.target.value)} />
                        <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Country" value={checkoutForm.country} onChange={(e) => updateCheckoutField("country", e.target.value)} />
                      </div>
                      <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Landmark (optional)" value={checkoutForm.landmark} onChange={(e) => updateCheckoutField("landmark", e.target.value)} />
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <h3 className="text-sm font-bold text-gray-900">Pickup Details</h3>
                  <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Pickup Point Name *" value={checkoutForm.pickupPointName} onChange={(e) => updateCheckoutField("pickupPointName", e.target.value)} />
                  <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Pickup Location *" value={checkoutForm.pickupLocation} onChange={(e) => updateCheckoutField("pickupLocation", e.target.value)} />
                  <input className="w-full rounded border border-gray-300 px-3 py-2 text-xs" placeholder="Pickup Address" value={checkoutForm.pickupAddress} onChange={(e) => updateCheckoutField("pickupAddress", e.target.value)} />
                </div>
              )}

              <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                <h3 className="text-sm font-bold text-gray-900">Payment Method</h3>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={checkoutForm.paymentMethod}
                  onChange={(e) => updateCheckoutField("paymentMethod", e.target.value)}
                >
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="online">Online Payment</option>
                  <option value="credit_card">Credit Card</option>
                </select>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2 text-xs"
                  placeholder="Order Notes (optional)"
                  value={checkoutForm.notes}
                  onChange={(e) => updateCheckoutField("notes", e.target.value)}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                onClick={handleCheckout}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Placing Order..." : "Proceed to Checkout"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
