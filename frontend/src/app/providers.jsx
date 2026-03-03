"use client";

import { AuthProvider } from "@/components/context/AuthContext";
import { CartProvider } from "@/components/context/CartContext";
import { ToastProvider } from "@/components/context/ToastContext";
import { WishlistProvider } from "@/components/context/WishlistContext";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
