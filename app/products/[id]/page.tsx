import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { notFound } from "next/navigation";
import { products } from "../productsData";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return products.map((p) => ({ id: p._id }));
}

export default async function ProductDetails({ params }: PageProps) {
  const { id } = await params;
  const product = products.find((p) => p._id === id);
  if (!product) return notFound();

  return (
    <section className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-8">
      <div>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={800}
          height={600}
          className="rounded-xl object-cover w-full h-auto"
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <p className="mt-3 text-2xl text-green-600 font-semibold">${product.price}</p>
        <p className="mt-5 text-gray-700 leading-relaxed">{product.description}</p>
        <div className="mt-8 flex gap-4">
          <button className="px-5 py-3 bg-primary text-white rounded-md hover:opacity-90 inline-flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Add to Cart
          </button>
          <Link href="/products" className="px-5 py-3 border rounded-md hover:bg-gray-50 inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Back to Products
          </Link>
        </div>
      </div>
    </section>
  );
}


