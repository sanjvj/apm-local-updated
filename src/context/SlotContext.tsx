import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { DeliverySlot } from '../types/slot';
import { MADURAI_SLOTS } from '../data/slotData';

const STORAGE_KEYS = {
  SLOTS: 'apm_local_delivery_slots',
  LAST_RESET: 'apm_local_delivery_slots_last_reset',
};

export interface SlotContextType {
  slots: DeliverySlot[];
  addSlot: (slotData: Omit<DeliverySlot, 'id' | 'filled'>) => void;
  updateSlot: (updatedSlot: DeliverySlot) => void;
  deleteSlot: (slotId: string) => void;
  bookSlot: (slotId: string) => void;
  resetAllSlotsToCapacity: () => void;
}

const SlotContext = createContext<SlotContextType | undefined>(undefined);

export const SlotProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [slots, setSlots] = useState<DeliverySlot[]>(() => {
    try {
      const todayStr = new Date().toDateString();
      const lastReset = localStorage.getItem(STORAGE_KEYS.LAST_RESET);
      const savedSlots = localStorage.getItem(STORAGE_KEYS.SLOTS);

      let initialList = MADURAI_SLOTS;
      if (savedSlots) {
        const parsed = JSON.parse(savedSlots);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialList = parsed;
        }
      }

      // Check if new day: reset filled count if day changed
      if (lastReset !== todayStr) {
        localStorage.setItem(STORAGE_KEYS.LAST_RESET, todayStr);
        return initialList.map((s) => ({ ...s, filled: 0 }));
      }

      return initialList;
    } catch {
      return MADURAI_SLOTS;
    }
  });

  // Persist slots state to localStorage whenever slots change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    } catch (e) {
      console.warn('Failed to persist slots to localStorage:', e);
    }
  }, [slots]);

  // Book a spot in a particular slot (reduces available capacity by 1)
  const bookSlot = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          return {
            ...s,
            filled: Math.min(s.capacity, s.filled + 1),
          };
        }
        return s;
      })
    );
  };

  // Add a new delivery slot
  const addSlot = (slotData: Omit<DeliverySlot, 'id' | 'filled'>) => {
    const newSlot: DeliverySlot = {
      ...slotData,
      id: `slot-${Date.now()}`,
      filled: 0,
    };
    setSlots((prev) => [...prev, newSlot]);
  };

  // Edit/Update existing delivery slot
  const updateSlot = (updatedSlot: DeliverySlot) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === updatedSlot.id ? updatedSlot : s))
    );
  };

  // Delete a delivery slot
  const deleteSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  // Reset all slots back to max capacity at start of day
  const resetAllSlotsToCapacity = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem(STORAGE_KEYS.LAST_RESET, todayStr);
    setSlots((prev) => prev.map((s) => ({ ...s, filled: 0 })));
  };

  return (
    <SlotContext.Provider
      value={{
        slots,
        addSlot,
        updateSlot,
        deleteSlot,
        bookSlot,
        resetAllSlotsToCapacity,
      }}
    >
      {children}
    </SlotContext.Provider>
  );
};

export const useSlots = (): SlotContextType => {
  const context = useContext(SlotContext);
  if (!context) {
    throw new Error('useSlots must be used within a SlotProvider');
  }
  return context;
};
