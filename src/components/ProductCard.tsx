import Image from "next/image";
import Link from "next/link";
import { Product } from "../types/product";
import { ArrowRight } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={300}
        height={200}
        className="rounded-lg object-cover"
      />
      <h3 className="mt-3 text-lg font-semibold">{product.name}</h3>
      <p className="text-primary font-semibold">${product.price}</p>
      <Link
        href={`/products/${product._id}`}
        className="inline-block mt-2 text-primary font-medium hover:underline"
      >
        <span className="inline-flex items-center gap-1">View Details <ArrowRight className="w-4 h-4" /></span>
      </Link>
    </div>
  );
}
