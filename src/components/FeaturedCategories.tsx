"use client";

import {
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Ear,
  Speaker,
  Wifi,
  Watch,
  Pen,
  Plug,
  Cable,
  Battery,
  Dock,
  Zap,
} from "lucide-react";

const categories = [
  { name: "Mobile Phone", icon: Smartphone },
  { name: "Tablet", icon: Tablet },
  { name: "Laptop", icon: Laptop },
  { name: "Airpods", icon: Headphones }, // ✅ replaced Earbuds with Headphones
  { name: "Wireless Headphone", icon: Ear },
  { name: "Wired Headphone", icon: Headphones },
  { name: "Headphone", icon: Headphones },
  { name: "Speakers", icon: Speaker },
  { name: "Starlink", icon: Wifi },
  { name: "Smart Watch", icon: Watch },
  { name: "Smart Pen", icon: Pen },
  { name: "Power Adapter", icon: Plug },
  { name: "Cables", icon: Cable },
  { name: "Power Bank", icon: Battery },
  { name: "Hubs & Docks", icon: Dock },
  { name: "Wireless Charger", icon: Zap },
];

export default function FeaturedCategories() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-10">
          Featured{" "}
          <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Categories
          </span>
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8">
          {categories.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="p-4 rounded-2xl bg-gray-100 hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 hover:text-white transition-colors">
                <Icon size={32} />
              </div>
              <p className="text-sm font-medium text-gray-700">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
