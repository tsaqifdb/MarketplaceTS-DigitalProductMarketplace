export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: string;
  quantity: number;
  seller: string;
  image: string;
  selected: boolean;
}

export const addToCart = (product: Omit<CartItem, 'selected' | 'id'>) => {
  try {
    const existingCart = getCartItems();
    const existingItemIndex = existingCart.findIndex(item => item.productId === product.productId);

    let updatedCart: CartItem[];
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      updatedCart = existingCart.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + product.quantity }
          : item
      );
    } else {
      // Add new item with a unique ID
      updatedCart = [...existingCart, { ...product, id: Date.now().toString(), selected: true }];
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return [];
  }
};

export const getCartItems = (): CartItem[] => {
  try {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

export const removeFromCart = (productId: string) => {
  try {
    const existingCart = getCartItems();
    const updatedCart = existingCart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return getCartItems();
  }
};

export const clearCart = () => {
  try {
    localStorage.removeItem('cart');
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    return [];
  }
};

export const getCartItemCount = (): number => {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
};

export const isInCart = (productId: string): boolean => {
  return getCartItems().some(item => item.productId === productId);
};

// For direct checkout (buy now) functionality
export const setCheckoutItems = (items: CartItem[]) => {
  try {
    localStorage.setItem('checkoutItems', JSON.stringify(items));
  } catch (error) {
    console.error('Error setting checkout items:', error);
  }
};
