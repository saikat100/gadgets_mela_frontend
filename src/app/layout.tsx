import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React from "react";

export const metadata = {
  title: "Gadgets Mela",
  description: "Buy mobiles, laptops, and more at best prices.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}