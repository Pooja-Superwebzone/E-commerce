"use client";

import Link from "next/link";

const shopLinks = [
  { label: "All Products", href: "/products" },
  { label: "Electronics", href: "/category/electronics" },
  { label: "Fashion", href: "/category/fashion" },
  { label: "Home & Kitchen", href: "/category/home" },
  { label: "Sports", href: "/category/sports" },
];

const helpLinks = [
  { label: "My Account", href: "/login" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
  { label: "Track Order", href: "/cart" },
  { label: "Return Policy", href: "/products" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/products" },
  { label: "Terms & Conditions", href: "/products" },
  { label: "Shipping Policy", href: "/products" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
                S
              </div>
              <h3 className="text-xl font-bold text-gray-900">ShopHub</h3>
            </div>
            <p className="text-sm text-gray-600 leading-6">
              Trusted online shopping for quality products, secure payments, and
              fast delivery across India.
            </p>
            <div className="mt-5 space-y-1 text-sm text-gray-600">
              <p>support@shophub.com</p>
              <p>+91 98765 43210</p>
              <p>Mon - Sun, 9:00 AM to 9:00 PM</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-blue-600 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Help
            </h4>
            <ul className="space-y-3">
              {helpLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-blue-600 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-gray-500">
            Copyright {year} ShopHub. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {policyLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-gray-500 hover:text-blue-600 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-gray-300">
            100% secure payments and buyer protection
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-1.5 transition w-fit"
          >
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
