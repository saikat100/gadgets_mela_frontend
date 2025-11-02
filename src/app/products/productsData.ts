export type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
};

export const products: Product[] = [
  {
    _id: "1",
    name: "iPhone 15 Pro",
    price: 999,
    imageUrl: "https://i.ibb.co/XYZ123/sample1.jpg",
    description: "Latest Apple smartphone with A17 chip.",
  },
  {
    _id: "2",
    name: "Samsung Galaxy S24",
    price: 899,
    imageUrl: "https://i.ibb.co/XYZ456/sample2.jpg",
    description: "Flagship Android phone with excellent display.",
  },
];


