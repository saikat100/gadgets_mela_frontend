"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Cart", path: "/cart" },
    { name: "Checkout", path: "/checkout" },
  ];

  return (
    <nav className="sticky top-0 bg-[var(--background)] shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-primary hover:opacity-90">
          Gadgets Mela
        </Link>
        <ul className="flex space-x-6 items-center">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`${
                  pathname === item.path ? "text-primary font-semibold" : "text-gray-700"
                } hover:text-primary`}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/cart" className="text-gray-700 hover:text-primary flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="sr-only">Cart</span>
            </Link>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
}
