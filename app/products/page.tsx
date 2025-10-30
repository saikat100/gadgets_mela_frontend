import ProductGrid from "../../src/components/ProductGrid";
import { products as sampleProducts } from "./productsData";

export default function ProductsPage() {
  return (
    <section className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-primary">Our Products</h2>
      <ProductGrid products={sampleProducts} />
    </section>
  );
}


