import type { MenuItem } from './menu';
import type { DeliverySlot } from './slot';
import type { SavedAddress } from './address';
import type { OrderStatus, DeliveryPartner, OrderTimelineStep } from './delivery';

export interface OrderItemSnapshot {
  item: MenuItem;
  quantity: number;
}

export interface OrderSnapshot {
  orderId: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  slot: DeliverySlot | null;
  address: SavedAddress | null;
  createdAt: string;
  
  // Extended Tracking & Admin Fields
  status: OrderStatus;
  assignedPartner?: DeliveryPartner | null;
  timeline: OrderTimelineStep[];
  estimatedDeliveryTime?: string;
  adminNotes?: string;
  customerName?: string;
  customerPhone?: string;
}
