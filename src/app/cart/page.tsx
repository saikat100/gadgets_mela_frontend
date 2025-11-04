"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../../types/product";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

interface CartItem extends Product {
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      // Fetch latest product data to get current stock
      const updatedCart = await Promise.all(
        cart.map(async (item: CartItem) => {
          try {
            const res = await fetch(`http://localhost:5000/api/products/${item._id}`);
            if (res.ok) {
              const product = await res.json();
              return { ...item, stock: product.stock, price: product.price, discount: product.discount };
            }
            return item;
          } catch (err) {
            return item;
          }
        })
      );
      
      setCartItems(updatedCart);
      setLoading(false);
    } catch (err) {
      setCartItems([]);
      setLoading(false);
    }
  }

  function updateQuantity(id: string, newQuantity: number) {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }

    const item = cartItems.find((item) => item._id === id);
    if (!item) return;

    // Check stock limit
    if (item.stock !== undefined && item.stock > 0) {
      if (newQuantity > item.stock) {
        setError(`Only ${item.stock} items available in stock for ${item.name}`);
        setTimeout(() => setError(""), 3000);
        return;
      }
    }

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = cart.map((item: CartItem) =>
        item._id === id ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      
      // Update state with latest stock info
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      setError("");
    } catch (err) {
      setError("Failed to update quantity");
      setTimeout(() => setError(""), 3000);
    }
  }

  function removeItem(id: string) {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = cart.filter((item: CartItem) => item._id !== id);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      setCartItems(updatedCart);
    } catch (err) {
      console.error("Failed to remove item");
    }
  }

  function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
      localStorage.setItem("cart", "[]");
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      setCartItems([]);
    }
  }

  function calculateDiscountedPrice(price: number, discount: number = 0) {
    return price * (1 - discount / 100);
  }

  function calculateItemTotal(item: CartItem) {
    const finalPrice = calculateDiscountedPrice(item.price, item.discount || 0);
    return finalPrice * item.quantity;
  }

  function calculateSubtotal() {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  }

  function isMaxQuantity(item: CartItem) {
    if (item.stock === undefined) return false;
    return item.quantity >= item.stock;
  }

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="text-center py-12">Loading...</div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to your cart to continue shopping.</p>
          <Link
            href="/products"
            className="inline-block bg-primary text-white px-6 py-3 rounded hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <section className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const finalPrice = calculateDiscountedPrice(item.price, item.discount || 0);
            const itemTotal = calculateItemTotal(item);
            const maxQuantity = isMaxQuantity(item);
            const outOfStock = item.stock !== undefined && item.stock <= 0;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 ${
                  outOfStock ? "opacity-60" : ""
                }`}
              >
                <Link href={`/products/${item._id}`} className="flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={150}
                    height={150}
                    className="rounded-lg object-cover w-full md:w-[150px] h-[150px]"
                  />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/products/${item._id}`}>
                      <h3 className="text-xl font-semibold hover:text-primary">{item.name}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {item.discount && item.discount > 0 ? (
                        <>
                          <span className="text-gray-500 line-through">${item.price.toFixed(2)}</span>
                          <span className="text-primary font-semibold">${finalPrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-primary font-semibold">${item.price.toFixed(2)}</span>
                      )}
                    </div>
                    {item.stock !== undefined && (
                      <p className={`text-sm mt-1 ${
                        item.stock > 0 
                          ? item.stock < 10 
                            ? "text-orange-600" 
                            : "text-green-600"
                          : "text-red-600"
                      }`}>
                        {item.stock > 0 
                          ? `Stock: ${item.stock} available` 
                          : "Out of Stock"}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className={`w-8 h-8 rounded border flex items-center justify-center ${
                            item.quantity <= 1
                              ? "opacity-50 cursor-not-allowed bg-gray-100"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={maxQuantity || outOfStock}
                          className={`w-8 h-8 rounded border flex items-center justify-center ${
                            maxQuantity || outOfStock
                              ? "opacity-50 cursor-not-allowed bg-gray-100"
                              : "hover:bg-gray-100"
                          }`}
                          title={maxQuantity ? "Maximum quantity reached" : outOfStock ? "Out of stock" : "Increase quantity"}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {maxQuantity && (
                        <span className="text-xs text-orange-600">Max quantity reached</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Item Total</p>
                      <p className="text-lg font-bold text-green-600">${itemTotal.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-primary text-white text-center py-3 rounded hover:opacity-90 font-semibold mb-3"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="block w-full text-center py-3 border rounded hover:bg-gray-50 text-gray-700 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}