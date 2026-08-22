export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'packed'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
  vehicleType: string;
  status: 'available' | 'on_delivery' | 'offline';
  activeOrdersCount: number;
  rating: number;
  avatar: string;
  currentArea?: string;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  completed: boolean;
  note?: string;
}

export interface ClusterRequest {
  id: string;
  clusterId: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  vehicleType: string;
  vehicleNo: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  ordersCount: number;
  payoutAmount: number;
  totalDistanceKm: number;
}
