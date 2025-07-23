export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: string;
  quantity: number;
  seller: string;
  thumbnailUrl?: string;
  contentUrl?: string;
  selected: boolean;
}

export interface Cart {
  items: CartItem[];
}