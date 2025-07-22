import { Product } from "./Product";

export interface ShopProfile {
  _id: string;
  userId: string;
  name: string;
  username: string;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  categories: string[];
  productIds: Product[];
  rating: number;
  ratingCount: number;
  followers: number;
  isVerified: boolean;
  createdAt: string;
}
