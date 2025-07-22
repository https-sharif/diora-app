import { create } from 'zustand';
import { Product } from '@/types/Product';
import { CartItem } from '@/types/CartItem';
import { WishlistItem } from '@/types/WishlistItem';
import { useAuthStore } from '@/stores/useAuthStore';

interface ShoppingStore {
  cart: CartItem[];
  wishlist: WishlistItem[];

  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;

  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  getCartTotal: (products: Product[]) => number;
  getCartItemCount: () => number;
}

export const useShoppingStore = create<ShoppingStore>((set, get) => ({
  cart: [],
  wishlist: [],

  addToCart: (product, size, variant) => {
    const user = useAuthStore.getState().user;
    if (!user) return console.error('User not authenticated');

    set((state) => {
      const existingItem = state.cart.find(
        (item) =>
          item.productId === product.id &&
          item.variant === variant &&
          item.size === size
      );

      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.productId === product.id &&
            item.size === size &&
            item.variant === variant
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      const newItem: CartItem = {
        id: (state.cart.length + 1).toString(),
        userId: user._id,
        productId: product.id,
        quantity: 1,
        size: size,
        variant: variant,
      };

      return { cart: [...state.cart, newItem] };
    });
  },

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    })),

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  addToWishlist: (product) => {
    const user = useAuthStore.getState().user;
    if (!user) return console.error('User not authenticated');

    set((state) => {
      const exists = state.wishlist.find(
        (item) => item.productId === product.id
      );
      if (exists) {
        return {
          wishlist: state.wishlist.filter(
            (item) => item.productId !== product.id
          ),
        };
      }

      const newItem: WishlistItem = {
        id: (state.wishlist.length + 1).toString(),
        userId: user._id,
        productId: product.id,
      };

      return { wishlist: [...state.wishlist, newItem] };
    });
  },

  removeFromWishlist: (productId) =>
    set((state) => ({
      wishlist: state.wishlist.filter((item) => item.productId !== productId),
    })),

  isInWishlist: (productId) =>
    get().wishlist.some((item) => item.productId === productId),

  getCartTotal: (products) => {
    const cart = get().cart;
    return cart.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return total;
      return total + product.price * item.quantity;
    }, 0);
  },

  getCartItemCount: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
}));
