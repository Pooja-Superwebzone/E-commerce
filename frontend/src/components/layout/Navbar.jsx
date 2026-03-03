"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/context/CartContext";
import { useAuth } from "@/components/context/AuthContext";
import { useWishlist } from "@/components/context/WishlistContext";
// SVG Icons
const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-6 0v4a3 3 0 006 0z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const HeartIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364 4.318 12.682a4.5 4.5 0 010-6.364z"
        />
    </svg>
);

const StoreIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { wishlistItems } = useWishlist();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getTotalItems } = useCart();
    const { user, logout } = useAuth();

    useEffect(() => {
        const query = searchParams.get("search") || "";
        setSearchQuery(query);
    }, [searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) {
            router.push("/products");
            return;
        }
        router.push(`/products?search=${encodeURIComponent(query)}`);
    };

    return (
        <>
            {/* Main Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-white shadow-md z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Top Row */}
                    <div className="flex justify-between items-center py-5 ">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-2xl font-bold flex items-center gap-1.5">
                                <span className="bg-blue-600 text-white px-2.5 py-1 rounded text-base font-bold">S</span>
                                <span className="text-gray-900 font-bold hidden sm:inline">ShopHub</span>
                            </div>
                        </Link>

                        {/* Search Bar (Main Feature) */}
                        <form onSubmit={handleSearch} className="flex-1 mx-3 sm:mx-6 max-w-2xl hidden sm:flex">
                            <div className="w-full relative flex items-center bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-600 focus-within:border-blue-600 transition">
                                <input
                                    type="text"
                                    placeholder="Search for products, brands, and more"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-transparent text-gray-900 text-sm focus:outline-none placeholder-gray-500 font-medium"
                                />
                                <button type="submit" className="px-4 py-2.5 text-gray-600 hover:text-blue-600 transition font-semibold flex items-center justify-center">
                                    <SearchIcon />
                                </button>
                            </div>
                        </form>

                        {/* Right Icons */}
                        <div className="flex items-center gap-1 sm:gap-3 ml-2">
                            {/* Login/User */}
                            {!user ? (
                                <Link href="/login" className="flex items-center gap-1.5 hover:text-blue-600 transition text-xs sm:text-sm font-semibold text-gray-900 py-2 px-2 rounded-lg hover:bg-gray-50">
                                    <LockIcon />
                                    <span className="hidden sm:inline whitespace-nowrap">Login/Signup</span>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-2 rounded-lg text-gray-900 font-semibold">
                                    <UserIcon />
                                    <span className="hidden md:inline text-sm whitespace-nowrap">{user.name}</span>
                                  </div>
                                  <button
                                      onClick={async () => {
                                          await logout();
                                          router.push("/");
                                      }}
                                      className="text-xs sm:text-sm py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-semibold"
                                  >
                                      Logout
                                  </button>
                                </div>
                            )}

                            <Link href="/wishlist" className="relative">
                                <button className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-pink-50 transition text-gray-900 hover:text-pink-600 font-semibold relative">
                                    <HeartIcon />
                                    <span className="hidden sm:inline text-sm">Wishlist</span>

                                    {wishlistItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full px-1">
                                            {wishlistItems.length}
                                        </span>
                                    )}
                                </button>
                            </Link>

                            {/* Cart */}
                            <Link href="/cart" className="relative">
                                <button className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-50 transition text-gray-900 hover:text-blue-600 font-semibold relative">
                                    <CartIcon />
                                    <span className="hidden sm:inline text-sm">Cart</span>
                                    {getTotalItems() > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full text-center px-0.5 ">
                                            {getTotalItems()}
                                        </span>
                                    )}
                                </button>
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition text-gray-900"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <MenuIcon />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="sm:hidden pb-3">
                        <div className="relative flex items-center bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-600 focus-within:border-blue-600 transition">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 bg-transparent text-gray-900 text-sm focus:outline-none placeholder-gray-500 font-medium"
                            />
                            <button type="submit" className="px-3 text-gray-600 hover:text-blue-600 transition flex items-center justify-center">
                                <SearchIcon />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="sm:hidden bg-white border-t border-gray-200 px-3 py-3 space-y-1">
                        <Link
                            href="/products"
                            className="flex items-center gap-2 px-3 py-2.5 text-gray-900 hover:bg-blue-50 rounded-lg transition text-sm font-semibold"
                        >
                            <CartIcon />
                            <span>Products</span>
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center gap-2 px-3 py-2.5 text-gray-900 hover:bg-blue-50 rounded-lg transition text-sm font-semibold"
                        >
                            <StoreIcon />
                            <span>Become Seller</span>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="h-20" />
        </>
    );
}
