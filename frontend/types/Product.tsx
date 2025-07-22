import { ShopProfile } from "./ShopProfile";

export interface Product {
    _id: string;
    shopId: ShopProfile;
    name: string;
    price: number;
    imageUrl: string[];
    category: string[];
    description: string;
    sizes: string[];
    variants: string[];
    stock: number;
    rating: number;
    reviewCount: number;
    discount?: number;
  }