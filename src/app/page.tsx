import FeaturedCategories from "../components/FeaturedCategories";
import NewArrival from "../components/NewArrival";
import TopSale from "../components/TopSale";
import BestDeal from "../components/BestDeal";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold text-green-600">Welcome to Gadgets Mela</h1>
      <p className="mt-4 text-gray-700 text-lg">Your one-stop shop for mobiles, laptops, and accessories.</p>
      <FeaturedCategories />
      <NewArrival />
      <BestDeal />
      <TopSale />
    </main>
  );
}