export type CategoryId = 'all' | 'sweets' | 'beverages' | 'snacks' | 'ghewar' | 'karupatti' | 'gift-boxes' | 'gift';

export interface Category {
  id: CategoryId;
  label: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Exclude<CategoryId, 'all'>;
  price: number;
  meta: string; // e.g. "250g" or "500g"
  gradient: [string, string]; // two HEX color codes for gradient card fallback
  isSpotlight?: boolean;
  isSignature?: boolean;
  stockBadge?: string;
  badgeType?: 'gold' | 'crimson' | 'dark';
  imageUrl?: string;
  isOutOfStock?: boolean;
  stock?: number;
  description?: string;
}

export interface CartItem {
  itemId: string;
  quantity: number;
}
