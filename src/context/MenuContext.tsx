import type { ReactNode, FC } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { MenuItem } from '../types/menu';
import { MENU_ITEMS } from '../data/menuData';

const MENU_STORAGE_KEY = 'apm_local_delivery_menu_items';

export interface MenuContextType {
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (updatedItem: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleStockStatus: (itemId: string) => void;
  getMenuItemById: (itemId: string) => MenuItem | undefined;
  resetToDefaultMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Rehydrate Menu Items from localStorage or fallback to default MENU_ITEMS
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return MENU_ITEMS;
    } catch {
      return MENU_ITEMS;
    }
  });

  // Sync Menu Items state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuItems));
    } catch (e) {
      console.warn('Failed to save menu items to localStorage:', e);
    }
  }, [menuItems]);

  // Add a new menu item
  const addMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => [item, ...prev]);
  };

  // Update an existing menu item
  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Delete a menu item
  const deleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Toggle in-stock / out-of-stock
  const toggleStockStatus = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, isOutOfStock: !item.isOutOfStock }
          : item
      )
    );
  };

  const getMenuItemById = (itemId: string) => {
    return menuItems.find((i) => i.id === itemId);
  };

  const resetToDefaultMenu = () => {
    setMenuItems(MENU_ITEMS);
    localStorage.removeItem(MENU_STORAGE_KEY);
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleStockStatus,
        getMenuItemById,
        resetToDefaultMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
