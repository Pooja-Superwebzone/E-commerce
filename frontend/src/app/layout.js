import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Providers } from "./providers";
import Toast from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ShopHub - Your Premium Online Store",
  description: "Discover amazing products at unbeatable prices. Shop electronics, fashion, and more.",
  keywords: "ecommerce, shopping, online store, products",
  openGraph: {
    title: "ShopHub - Your Premium Online Store",
    description: "Discover amazing products at unbeatable prices",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-50`}
      >
        <Providers>
          <Navbar />
          <main className="grow">
            {children}
          </main>
          <Footer />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
