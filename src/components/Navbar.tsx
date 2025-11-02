"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) setLoggedIn(true);
    else setLoggedIn(false);
    
    // Load cart count
    updateCartCount();
  }, [pathname]);

  // Listen for cart changes
  useEffect(() => {
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab updates
    const interval = setInterval(updateCartCount, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (err) {
      setCartCount(0);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    router.push("/");
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
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
            <Link 
              href="/cart" 
              className={`relative text-gray-700 hover:text-primary flex items-center gap-2 ${
                pathname === "/cart" ? "text-primary" : ""
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
              <span className="sr-only">Cart ({cartCount} items)</span>
            </Link>
          </li>
          <li>
            {loggedIn ? (
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-primary px-4 py-2 border rounded"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary px-4 py-2 border rounded"
              >
                Login
              </Link>
            )}
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
}