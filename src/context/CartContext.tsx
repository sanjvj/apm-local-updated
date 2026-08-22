import type { ReactNode, FC } from 'react';
import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useMenu } from './MenuContext';
import { INITIAL_SAVED_ADDRESSES } from '../data/addressData';
import type { MenuItem } from '../types/menu';
import type { SavedAddress } from '../types/address';
import type { OrderSnapshot } from '../types/order';

const STORAGE_KEYS = {
  CART: 'apm_local_delivery_cart',
  SLOT: 'apm_local_delivery_slot',
  ADDRESS: 'apm_local_delivery_address',
  SAVED_ADDRESSES: 'apm_local_delivery_saved_addresses',
  PAYMENT: 'apm_local_delivery_payment',
  LAST_ORDER: 'apm_local_delivery_last_order',
  SCREEN: 'apm_local_delivery_screen',
};

export interface CartContextType {
  cart: Record<string, number>;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  getItemQty: (itemId: string) => number;
  totalItems: number;
  subtotal: number;
  cartItemsList: { item: MenuItem; quantity: number }[];
  clearCart: () => void;
  toastMessage: string | null;
  triggerToast: (msg: string) => void;
  
  // Persisted Flow States
  selectedSlotId: string | null;
  setSelectedSlotId: (slotId: string | null) => void;
  
  savedAddresses: SavedAddress[];
  addSavedAddress: (address: SavedAddress) => void;
  updateSavedAddress: (address: SavedAddress) => void;
  deleteSavedAddress: (addressId: string) => void;
  selectedAddress: SavedAddress | null;
  setSelectedAddress: (address: SavedAddress | null) => void;
  
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (method: string | null) => void;

  lastOrder: OrderSnapshot | null;
  setLastOrder: (order: OrderSnapshot | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { menuItems } = useMenu();

  // Rehydrate Cart State safely from localStorage
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      if (typeof parsed !== 'object' || parsed === null) return {};

      const validCart: Record<string, number> = {};
      Object.entries(parsed).forEach(([id, qty]) => {
        if (typeof qty === 'number' && qty > 0) {
          validCart[id] = qty;
        }
      });
      return validCart;
    } catch {
      return {};
    }
  });

  // Rehydrate Selected Slot ID
  const [selectedSlotId, setSelectedSlotIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SLOT);
    } catch {
      return null;
    }
  });

  // Rehydrate Saved Addresses List
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_ADDRESSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SAVED_ADDRESSES;
    } catch {
      return INITIAL_SAVED_ADDRESSES;
    }
  });

  // Rehydrate Currently Selected Address
  const [selectedAddress, setSelectedAddressState] = useState<SavedAddress | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADDRESS);
      if (saved) return JSON.parse(saved);
      return INITIAL_SAVED_ADDRESSES[0] || null;
    } catch {
      return INITIAL_SAVED_ADDRESSES[0] || null;
    }
  });

  // Rehydrate Selected Payment Method
  const [selectedPaymentMethod, setSelectedPaymentMethodState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PAYMENT) || 'cod';
    } catch {
      return 'cod';
    }
  });

  // Rehydrate Last Order Snapshot
  const [lastOrder, setLastOrderState] = useState<OrderSnapshot | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_ORDER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Cart state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  // Sync Saved Addresses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_ADDRESSES, JSON.stringify(savedAddresses));
    } catch (e) {
      console.warn('Failed to save addresses to localStorage:', e);
    }
  }, [savedAddresses]);

  const addSavedAddress = (address: SavedAddress) => {
    setSavedAddresses((prev) => [address, ...prev]);
    setSelectedAddress(address);
    triggerToast('Address saved successfully');
  };

  const updateSavedAddress = (updatedAddress: SavedAddress) => {
    setSavedAddresses((prev) =>
      prev.map((a) => (a.id === updatedAddress.id ? updatedAddress : a))
    );
    if (selectedAddress?.id === updatedAddress.id) {
      setSelectedAddress(updatedAddress);
    }
    triggerToast('Address updated');
  };

  const deleteSavedAddress = (addressId: string) => {
    setSavedAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== addressId);
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(remaining.length > 0 ? remaining[0] : null);
      }
      return remaining;
    });
    triggerToast('Address deleted');
  };

  const setSelectedSlotId = (slotId: string | null) => {
    setSelectedSlotIdState(slotId);
    try {
      if (slotId) {
        localStorage.setItem(STORAGE_KEYS.SLOT, slotId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SLOT);
      }
    } catch (e) {
      console.warn('Failed to save slot to localStorage:', e);
    }
  };

  const setSelectedAddress = (address: SavedAddress | null) => {
    setSelectedAddressState(address);
    try {
      if (address) {
        localStorage.setItem(STORAGE_KEYS.ADDRESS, JSON.stringify(address));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ADDRESS);
      }
    } catch (e) {
      console.warn('Failed to save address to localStorage:', e);
    }
  };

  const setSelectedPaymentMethod = (method: string | null) => {
    setSelectedPaymentMethodState(method);
    try {
      if (method) {
        localStorage.setItem(STORAGE_KEYS.PAYMENT, method);
      } else {
        localStorage.removeItem(STORAGE_KEYS.PAYMENT);
      }
    } catch (e) {
      console.warn('Failed to save payment method to localStorage:', e);
    }
  };

  const setLastOrder = (order: OrderSnapshot | null) => {
    setLastOrderState(order);
    try {
      if (order) {
        localStorage.setItem(STORAGE_KEYS.LAST_ORDER, JSON.stringify(order));
      } else {
        localStorage.removeItem(STORAGE_KEYS.LAST_ORDER);
      }
    } catch (e) {
      console.warn('Failed to save last order to localStorage:', e);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  const addToCart = (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    setCart((prev) => {
      const currentQty = prev[itemId] || 0;
      return { ...prev, [itemId]: currentQty + 1 };
    });
    if (item) {
      triggerToast(`${item.name} added to cart`);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const currentQty = prev[itemId] || 0;
      if (currentQty <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: currentQty - 1 };
    });
  };

  const updateQty = (itemId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: qty };
    });
  };

  const getItemQty = (itemId: string) => {
    return cart[itemId] || 0;
  };

  const cartItemsList = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const item = menuItems.find((i) => i.id === id);
        if (!item || qty <= 0) return null;
        return { item, quantity: qty };
      })
      .filter((entry): entry is { item: MenuItem; quantity: number } => entry !== null);
  }, [cart, menuItems]);

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, q) => sum + q, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cartItemsList.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  }, [cartItemsList]);

  const clearCart = () => {
    setCart({});
    setSelectedSlotId(null);
    setSelectedAddress(null);
    setSelectedPaymentMethod(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        getItemQty,
        totalItems,
        subtotal,
        cartItemsList,
        clearCart,
        toastMessage,
        triggerToast,
        selectedSlotId,
        setSelectedSlotId,
        savedAddresses,
        addSavedAddress,
        updateSavedAddress,
        deleteSavedAddress,
        selectedAddress,
        setSelectedAddress,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
