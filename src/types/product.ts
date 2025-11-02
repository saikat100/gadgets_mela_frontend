export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  imageUrl: string;
  stock?: number;
}