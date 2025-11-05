"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { ShoppingCart, Menu, X, ChevronDown, UserCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [subcatsByCat, setSubcatsByCat] = useState<Record<string, Array<{ _id: string; name: string; slug: string; category: string }>>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token"))
      setLoggedIn(true);
    else setLoggedIn(false);

    updateCartCount();
    // Load categories/subcategories (no auth needed)
    loadCategoriesAndSubcats();
    // Load user role
    loadUserRole();
  }, [pathname]);

  // Listen for cart changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") updateCartCount();
    };
    const handleCartUpdated = () => updateCartCount();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cart-updated", handleCartUpdated as any);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cart-updated", handleCartUpdated as any);
    };
  }, []);

  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1),
        0
      );
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }

  async function loadCategoriesAndSubcats() {
    try {
      const [catsRes, subsRes] = await Promise.all([
        fetch(api('/categories')),
        fetch(api('/subcategories')),
      ]);
      const cats = await catsRes.json();
      const subs = await subsRes.json();
      setCategories(cats);
      const grouped: Record<string, Array<{ _id: string; name: string; slug: string; category: string }>> = {};
      for (const s of subs) {
        const catId = typeof s.category === "string" ? s.category : s.category?._id;
        if (!catId) continue;
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push({ _id: s._id, name: s.name, slug: s.slug, category: catId });
      }
      setSubcatsByCat(grouped);
    } catch {
      // fail silently; keep menu empty
    }
  }

  async function loadUserRole() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const res = await fetch(api('/users/me'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        setIsAdmin(false);
        return;
      }
      const me = await res.json();
      setIsAdmin(me?.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    router.push("/");
    setMenuOpen(false);
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
  ];

  // Dynamic categories will render below

  return (
    <nav className="sticky top-0 bg-[var(--background)] shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-primary hover:opacity-90 whitespace-nowrap"
        >
          Gadgets Mela
        </Link>

        {/* Desktop Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); router.push(`/products?q=${encodeURIComponent(search)}`); }}
          className="hidden md:flex flex-1 max-w-xl"
          role="search"
          aria-label="Search products"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border rounded px-3 py-2"
          />
        </form>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
          <li>
            <button
              aria-label="Search"
              onClick={() => router.push(search ? `/products?q=${encodeURIComponent(search)}` : "/products")}
              className="text-gray-700 hover:text-primary p-2 rounded"
            >
              <Search className="w-5 h-5" />
            </button>
          </li>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`${pathname === item.path
                    ? "text-primary font-semibold"
                    : "text-gray-700"
                  } hover:text-primary`}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/cart"
              className={`relative text-gray-700 hover:text-primary flex items-center gap-2 ${pathname === "/cart" ? "text-primary" : ""
                }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <span className="sr-only">Cart ({cartCount} items)</span>
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
              className="text-gray-700 hover:text-primary px-2 py-2 rounded inline-flex items-center gap-2"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <UserCircle className="w-6 h-6" />
              <ChevronDown className="w-4 h-4" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-50 min-w-[200px]">
                <ul className="py-1 text-sm">
                  <li>
                    <Link
                      href={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary"
                      onClick={() => setProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  {loggedIn ? (
                    <li>
                      <button
                        onClick={() => { setProfileOpen(false); handleLogout(); }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary"
                      >
                        Logout
                      </button>
                    </li>
                  ) : (
                    <li>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary"
                        onClick={() => setProfileOpen(false)}
                      >
                        Login
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Search"
            className="md:hidden text-gray-700 hover:text-primary"
            onClick={() => { setMenuOpen(false); router.push(search ? `/products?q=${encodeURIComponent(search)}` : "/products"); }}
          >
            <Search className="w-6 h-6" />
          </button>
          <button
            className="md:hidden text-gray-700 hover:text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--background)] border-t border-gray-200 shadow-inner">
          <ul className="flex flex-col space-y-2 py-3 px-4">
            {/* Mobile Search */}
            <li>
              <form
                onSubmit={(e) => { e.preventDefault(); setMenuOpen(false); router.push(`/products?q=${encodeURIComponent(search)}`); }}
                role="search"
                aria-label="Search products"
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full border rounded px-3 py-2"
                />
              </form>
            </li>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 ${pathname === item.path
                      ? "text-primary font-semibold"
                      : "text-gray-700"
                    } hover:text-primary`}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            <li>
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className={`relative flex items-center gap-2 py-2 ${pathname === "/cart" ? "text-primary" : "text-gray-700"
                  } hover:text-primary`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute right-3 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </li>

            <li className="pt-2">
              <div className="border rounded p-3">
                <div className="font-semibold mb-2">Account</div>
                <div className="flex flex-col gap-2">
                  <Link
                    href={loggedIn ? (isAdmin ? "/admin/dashboard" : "/user/dashboard") : "/login"}
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-700 hover:text-primary px-3 py-2 border rounded"
                  >
                    {loggedIn ? "Dashboard" : "Login"}
                  </Link>
                  {loggedIn && (
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="text-gray-700 hover:text-primary px-3 py-2 border rounded text-left"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </li>

            {/* Mobile Categories with nested subcategories */}
            {categories.length > 0 && (
              <li className="pt-2">
                <div className="border rounded p-3">
                  <div className="font-semibold mb-2">Categories</div>
                  <ul className="flex flex-col divide-y">
                    {categories.map((cat) => {
                      const subcats = subcatsByCat[cat._id] || [];
                      const catHref = `/products?category=${encodeURIComponent(cat.slug)}`;
                      const isOpen = !!openCats[cat._id];
                      return (
                        <li key={cat._id} className="py-2">
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              href={catHref}
                              onClick={() => setMenuOpen(false)}
                              className="text-gray-700 hover:text-primary"
                            >
                              {cat.name}
                            </Link>
                            {subcats.length > 0 && (
                              <button
                                aria-label="Toggle subcategories"
                                onClick={() => setOpenCats((prev) => ({ ...prev, [cat._id]: !prev[cat._id] }))}
                                className="text-gray-600 hover:text-primary"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                          {isOpen && subcats.length > 0 && (
                            <ul className="mt-2 ml-3 flex flex-col gap-1">
                              {subcats.map((s) => {
                                const shref = `/products?category=${encodeURIComponent(cat.slug)}&sub=${encodeURIComponent(s.slug)}`;
                                return (
                                  <li key={s._id}>
                                    <Link
                                      href={shref}
                                      onClick={() => setMenuOpen(false)}
                                      className="text-sm text-gray-600 hover:text-primary"
                                    >
                                      {s.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            )}

            <li className="pt-2">
              <ThemeToggle />
            </li>
          </ul>
        </div>
      )}


      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <ul className="hidden md:flex space-x-6 items-center">
          {categories.map((cat) => {
            const href = `/products?category=${encodeURIComponent(cat.slug)}`;
            const subcats = subcatsByCat[cat._id] || [];
            return (
              <li key={cat._id} className="relative group">
                <Link
                  href={href}
                  className={`${pathname === href ? "text-primary font-semibold" : "text-gray-700"} hover:text-primary inline-flex items-center gap-1`}
                >
                  {cat.name}
                  {subcats.length > 0 && <ChevronDown className="w-4 h-4" />}
                </Link>
                {subcats.length > 0 && (
                  <div className="absolute left-0 mt-2 hidden group-hover:block bg-white border rounded shadow-lg z-50 min-w-[220px]">
                    <ul className="py-2">
                      {subcats.map((s) => {
                        const shref = `/products?category=${encodeURIComponent(cat.slug)}&sub=${encodeURIComponent(s.slug)}`;
                        return (
                          <li key={s._id}>
                            <Link
                              href={shref}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                            >
                              {s.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
