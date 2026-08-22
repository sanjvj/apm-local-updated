import type { ReactNode, FC } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { OrderSnapshot } from '../types/order';
import type { DeliveryPartner, OrderStatus, OrderTimelineStep, ClusterRequest } from '../types/delivery';
import { INITIAL_DELIVERY_PARTNERS, INITIAL_MOCK_ORDERS } from '../data/deliveryData';

const STORAGE_KEYS = {
  ALL_ORDERS: 'apm_local_delivery_all_orders',
  PARTNERS: 'apm_local_delivery_partners',
  CLUSTER_REQUESTS: 'apm_cluster_requests',
  ORDER_AREAS: 'apm_local_delivery_order_area_map',
};

export const DEFAULT_ORDER_CLUSTER_MAP: Record<string, string> = {
  'APM-LD-61204': 'area-north',
  'APM-LD-53981': 'area-north',
  'APM-LD-48219': 'area-south',
  'APM-LD-94812': 'area-central',
  'APM-LD-88301': 'area-central',
  'APM-LD-74190': 'area-central',
  'APM-LD-27514': 'area-east',
  'APM-LD-16839': 'area-east',
  'APM-LD-10492': 'area-west',
};

const DEFAULT_TIMELINE_LABELS: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  confirmed: 'Order Confirmed & Paid',
  preparing: 'Kitchen Preparing Delicacies',
  packed: 'Packed & Ready at Hub',
  picked_up: 'Picked Up by Delivery Partner',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered to Doorstep',
  cancelled: 'Order Cancelled',
};

const STATUS_ORDER: OrderStatus[] = [
  'placed',
  'confirmed',
  'preparing',
  'packed',
  'picked_up',
  'out_for_delivery',
  'delivered',
];

export interface OrderContextType {
  allOrders: OrderSnapshot[];
  deliveryPartners: DeliveryPartner[];
  clusterRequests: ClusterRequest[];
  addOrderToSystem: (order: OrderSnapshot) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  assignPartnerToOrder: (orderId: string, partnerId: string) => void;
  togglePartnerStatus: (partnerId: string, status: 'available' | 'on_delivery' | 'offline') => void;
  addDeliveryPartner: (partner: Omit<DeliveryPartner, 'id'>) => void;
  updateDeliveryPartner: (partner: DeliveryPartner) => void;
  deleteDeliveryPartner: (partnerId: string) => void;
  getOrderById: (orderId: string) => OrderSnapshot | undefined;
  requestCluster: (
    clusterId: string,
    rider: { id: string; name: string; phone: string; vehicleType: string; vehicleNo: string },
    ordersCount: number,
    payoutAmount: number,
    totalDistanceKm: number
  ) => void;
  approveClusterRequest: (requestId: string) => void;
  rejectClusterRequest: (requestId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Rehydrate Orders List from localStorage or default to INITIAL_MOCK_ORDERS
  const [allOrders, setAllOrders] = useState<OrderSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
      return INITIAL_MOCK_ORDERS;
    } catch {
      return INITIAL_MOCK_ORDERS;
    }
  });

  // Rehydrate Delivery Partners List
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_DELIVERY_PARTNERS;
    } catch {
      return INITIAL_DELIVERY_PARTNERS;
    }
  });

  // Rehydrate Cluster Requests from localStorage
  const [clusterRequests, setClusterRequests] = useState<ClusterRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLUSTER_REQUESTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Sync Orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_ORDERS, JSON.stringify(allOrders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage:', e);
    }
  }, [allOrders]);

  // Sync Partners to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(deliveryPartners));
    } catch (e) {
      console.warn('Failed to save partners to localStorage:', e);
    }
  }, [deliveryPartners]);

  // Sync Cluster Requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLUSTER_REQUESTS, JSON.stringify(clusterRequests));
    } catch (e) {
      console.warn('Failed to save cluster requests to localStorage:', e);
    }
  }, [clusterRequests]);

  // Helper to build Timeline for an order
  const buildUpdatedTimeline = (
    currentTimeline: OrderTimelineStep[],
    newStatus: OrderStatus,
    note?: string
  ): OrderTimelineStep[] => {
    const targetIdx = STATUS_ORDER.indexOf(newStatus);
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return STATUS_ORDER.map((status, idx) => {
      const existingStep = currentTimeline.find((t) => t.status === status);
      const isCompleted = targetIdx >= 0 && idx <= targetIdx;

      return {
        status,
        label: DEFAULT_TIMELINE_LABELS[status],
        timestamp: isCompleted
          ? existingStep?.timestamp || nowTime
          : undefined,
        completed: isCompleted,
        note: status === newStatus && note ? note : existingStep?.note,
      };
    });
  };

  // Add a newly placed customer order
  const addOrderToSystem = (order: OrderSnapshot) => {
    const initialStatus: OrderStatus = order.status && order.status !== 'placed' ? order.status : 'confirmed';
    const orderWithTimeline: OrderSnapshot = {
      ...order,
      status: initialStatus,
      timeline: order.timeline || buildUpdatedTimeline([], initialStatus),
    };

    setAllOrders((prev) => [orderWithTimeline, ...prev.filter((o) => o.orderId !== order.orderId)]);
  };

  // Update Status of an Order
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    setAllOrders((prev) =>
      prev.map((order) => {
        if (order.orderId !== orderId) return order;

        const updatedTimeline = buildUpdatedTimeline(order.timeline || [], newStatus, note);

        return {
          ...order,
          status: newStatus,
          timeline: updatedTimeline,
        };
      })
    );
  };

  // Assign Delivery Partner to an Order
  const assignPartnerToOrder = (orderId: string, partnerId: string) => {
    const partner = deliveryPartners.find((p) => p.id === partnerId);

    setAllOrders((prev) =>
      prev.map((order) => {
        if (order.orderId !== orderId) return order;
        return {
          ...order,
          assignedPartner: partner || undefined,
          status: partner ? 'out_for_delivery' : 'confirmed',
          timeline: buildUpdatedTimeline(order.timeline || [], partner ? 'out_for_delivery' : 'confirmed', partner ? `Assigned to ${partner.name}` : 'Unassigned'),
        };
      })
    );

    if (partner) {
      setDeliveryPartners((prev) =>
        prev.map((p) => {
          if (p.id === partnerId) {
            return { ...p, status: 'on_delivery', activeOrdersCount: p.activeOrdersCount + 1 };
          }
          return p;
        })
      );
    }
  };

  // Toggle Partner Online Status
  const togglePartnerStatus = (
    partnerId: string,
    status: 'available' | 'on_delivery' | 'offline'
  ) => {
    setDeliveryPartners((prev) =>
      prev.map((p) => (p.id === partnerId ? { ...p, status } : p))
    );
  };

  // Add New Delivery Partner
  const addDeliveryPartner = (partnerData: Omit<DeliveryPartner, 'id'>) => {
    const newPartner: DeliveryPartner = {
      ...partnerData,
      id: `partner-${Date.now()}`,
    };
    setDeliveryPartners((prev) => [...prev, newPartner]);
  };

  // Update Existing Delivery Partner
  const updateDeliveryPartner = (updatedPartner: DeliveryPartner) => {
    setDeliveryPartners((prev) =>
      prev.map((p) => (p.id === updatedPartner.id ? updatedPartner : p))
    );

    setAllOrders((prev) =>
      prev.map((o) =>
        o.assignedPartner?.id === updatedPartner.id
          ? { ...o, assignedPartner: updatedPartner }
          : o
      )
    );
  };

  // Delete Delivery Partner
  const deleteDeliveryPartner = (partnerId: string) => {
    setDeliveryPartners((prev) => prev.filter((p) => p.id !== partnerId));

    setAllOrders((prev) =>
      prev.map((o) =>
        o.assignedPartner?.id === partnerId
          ? { ...o, assignedPartner: undefined }
          : o
      )
    );
  };

  const getOrderById = (orderId: string) => {
    return allOrders.find((o) => o.orderId.toLowerCase() === orderId.toLowerCase());
  };

  // Request Cluster Bidding by a Rider
  const requestCluster = (
    clusterId: string,
    rider: { id: string; name: string; phone: string; vehicleType: string; vehicleNo: string },
    ordersCount: number,
    payoutAmount: number,
    totalDistanceKm: number
  ) => {
    const existing = clusterRequests.find((r) => r.clusterId === clusterId && r.riderId === rider.id && r.status === 'pending');
    if (existing) return;

    const newReq: ClusterRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clusterId,
      riderId: rider.id,
      riderName: rider.name,
      riderPhone: rider.phone,
      vehicleType: rider.vehicleType,
      vehicleNo: rider.vehicleNo,
      requestedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      status: 'pending',
      ordersCount,
      payoutAmount,
      totalDistanceKm,
    };

    setClusterRequests((prev) => [newReq, ...prev]);
  };

  // Approve Cluster Request by Admin
  const approveClusterRequest = (requestId: string) => {
    const req = clusterRequests.find((r) => r.id === requestId);
    if (!req) return;

    const partnerObj: DeliveryPartner = {
      id: req.riderId,
      name: req.riderName,
      phone: req.riderPhone,
      vehicleNo: req.vehicleNo,
      vehicleType: req.vehicleType,
      status: 'on_delivery',
      activeOrdersCount: req.ordersCount,
      rating: 5.0,
      avatar: req.riderName.charAt(0).toUpperCase(),
    };

    let areaMap: Record<string, string> = DEFAULT_ORDER_CLUSTER_MAP;
    try {
      const savedMap = localStorage.getItem(STORAGE_KEYS.ORDER_AREAS);
      if (savedMap) areaMap = { ...DEFAULT_ORDER_CLUSTER_MAP, ...JSON.parse(savedMap) };
    } catch {}

    // Assign orders belonging to THIS cluster to the approved rider!
    setAllOrders((prev) =>
      prev.map((o) => {
        const orderCluster = areaMap[o.orderId] || DEFAULT_ORDER_CLUSTER_MAP[o.orderId] || 'area-central';
        if (orderCluster === req.clusterId && o.status !== 'delivered' && o.status !== 'cancelled') {
          return {
            ...o,
            assignedPartner: partnerObj,
            status: 'out_for_delivery',
            timeline: buildUpdatedTimeline(o.timeline || [], 'out_for_delivery', `Approved & Assigned to ${req.riderName}`),
          };
        }
        return o;
      })
    );

    // Save claimed orders in localStorage for rider portal
    try {
      const savedMap = JSON.parse(localStorage.getItem('apm_claimed_rider_clusters') || '{}');
      allOrders.forEach((o) => {
        const orderCluster = areaMap[o.orderId] || DEFAULT_ORDER_CLUSTER_MAP[o.orderId] || 'area-central';
        if (orderCluster === req.clusterId && o.status !== 'delivered' && o.status !== 'cancelled') {
          savedMap[o.orderId] = req.riderId;
        }
      });
      localStorage.setItem('apm_claimed_rider_clusters', JSON.stringify(savedMap));
    } catch {}

    // AUTOMATIC DELETION: 
    // 1. Delete ALL competing requests for this cluster ID (so no other rider gets this cluster)
    // 2. Delete ALL other pending requests by this approved rider (so rider focuses on 1 active cluster)
    setClusterRequests((prev) => prev.filter((r) => r.clusterId !== req.clusterId && r.riderId !== req.riderId));
  };

  // Reject Cluster Request by Admin
  const rejectClusterRequest = (requestId: string) => {
    setClusterRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  return (
    <OrderContext.Provider
      value={{
        allOrders,
        deliveryPartners,
        clusterRequests,
        addOrderToSystem,
        updateOrderStatus,
        assignPartnerToOrder,
        togglePartnerStatus,
        addDeliveryPartner,
        updateDeliveryPartner,
        deleteDeliveryPartner,
        getOrderById,
        requestCluster,
        approveClusterRequest,
        rejectClusterRequest,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
