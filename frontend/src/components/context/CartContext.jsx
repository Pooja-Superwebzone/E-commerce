"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useToast } from "@/components/context/ToastContext";
import { apiUrl } from "@/lib/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addToast } = useToast();

  const setItemsFromResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Cart request failed.");
    }
    setCart(data.items || []);
    return data.items || [];
  };

  useEffect(() => {
    const loadCart = async () => {
      if (loading) return;
      if (!user) {
        setCart([]);
        return;
      }
      try {
        const response = await fetch(apiUrl("/cart"), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        await setItemsFromResponse(response);
      } catch {
        setCart([]);
      }
    };

    loadCart();
  }, [user, loading]);

  const requireAuth = () => {
    if (user) return true;
    addToast("Please login/signup first to add items to cart.", "error");
    router.push("/login");
    return false;
  };

  const addToCart = async (product) => {
    if (!requireAuth()) return false;
    try {
      const response = await fetch(apiUrl("/cart/add"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
        cache: "no-store",
      });
      await setItemsFromResponse(response);
      return true;
    } catch {
      addToast("Failed to add item to cart.", "error");
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!requireAuth()) return;
    try {
      const response = await fetch(apiUrl(`/cart/item?productId=${productId}`), {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      await setItemsFromResponse(response);
    } catch {
      addToast("Failed to remove item.", "error");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!requireAuth()) return;
    try {
      const response = await fetch(apiUrl("/cart/item"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
        cache: "no-store",
      });
      await setItemsFromResponse(response);
    } catch {
      addToast("Failed to update quantity.", "error");
    }
  };

  const clearCart = async () => {
    if (!requireAuth()) return;
    try {
      const response = await fetch(apiUrl("/cart"), {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      await setItemsFromResponse(response);
    } catch {
      addToast("Failed to clear cart.", "error");
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
