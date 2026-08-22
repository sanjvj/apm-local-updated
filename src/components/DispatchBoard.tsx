import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { OrderSnapshot } from '../types/order';
import type { DeliveryPartner } from '../types/delivery';
import { DEFAULT_ORDER_CLUSTER_MAP } from '../context/OrderContext';
import {
  MapPin,
  Truck,
  Plus,
  Trash2,
  GripVertical,
  UserCheck,
  CheckCircle2,
  Search,
  Package,
  Clock,
  X,
  Phone,
} from 'lucide-react';

export interface AreaCluster {
  id: string;
  name: string;
  pincodes?: string[];
  assignedRiderId?: string | null;
}

const DEFAULT_AREAS: AreaCluster[] = [
  { id: 'area-north', name: 'North Madurai', pincodes: ['625002', '625018'], assignedRiderId: 'p2' },
  { id: 'area-south', name: 'South Madurai', pincodes: ['625003'], assignedRiderId: 'p1' },
  { id: 'area-central', name: 'Central Temple Zone', pincodes: ['625001', '625016'], assignedRiderId: null },
  { id: 'area-east', name: 'East Madurai', pincodes: ['625020', '625017'], assignedRiderId: 'p3' },
  { id: 'area-west', name: 'West Madurai (TVS Nagar)', pincodes: ['625016'], assignedRiderId: 'p4' },
];

const STORAGE_KEY_AREAS = 'apm_local_delivery_area_clusters';
const STORAGE_KEY_ORDER_AREAS = 'apm_local_delivery_order_area_map';

export interface DispatchBoardProps {
  orders: OrderSnapshot[];
  riders: DeliveryPartner[];
  onAssignPartnerToOrder: (orderId: string, partnerId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: any) => void;
  onToggleRiderStatus: (riderId: string, status: 'available' | 'on_delivery' | 'offline') => void;
  onNavigateToTrackOrder?: (orderId: string) => void;
}

export const DispatchBoard: FC<DispatchBoardProps> = ({
  orders,
  riders,
  onAssignPartnerToOrder,
  onUpdateOrderStatus,
  onToggleRiderStatus,
  onNavigateToTrackOrder,
}) => {
  // Load or initialize Area Clusters (Unlimited clusters, 5 per row)
  const [areas, setAreas] = useState<AreaCluster[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AREAS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_AREAS;
    } catch {
      return DEFAULT_AREAS;
    }
  });

  // Map of orderId -> areaId
  const [orderAreaMap, setOrderAreaMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDER_AREAS);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialMap: Record<string, string> = { ...DEFAULT_ORDER_CLUSTER_MAP };
    orders.forEach((o) => {
      if (!initialMap[o.orderId]) {
        const pin = o.address?.pincode;
        if (pin) {
          const match = DEFAULT_AREAS.find((a) => a.pincodes?.includes(pin));
          if (match) {
            initialMap[o.orderId] = match.id;
            return;
          }
        }
        initialMap[o.orderId] = 'area-central';
      }
    });
    return initialMap;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [draggedAreaId, setDraggedAreaId] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

  // Sync Areas to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AREAS, JSON.stringify(areas));
    } catch (e) {
      console.warn('Failed to save areas:', e);
    }
  }, [areas]);

  // Sync Order-Area Map to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDER_AREAS, JSON.stringify(orderAreaMap));
    } catch (e) {
      console.warn('Failed to save order-area map:', e);
    }
  }, [orderAreaMap]);

  // Active orders
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');

  // Filter active orders by search query
  const filteredActiveOrders = activeOrders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.address?.fullAddress && o.address.fullAddress.toLowerCase().includes(q)) ||
      (o.address?.pincode && o.address.pincode.toLowerCase().includes(q))
    );
  });

  // Get orders assigned to an area
  const getOrdersInArea = (areaId: string) => {
    return filteredActiveOrders.filter((o) => orderAreaMap[o.orderId] === areaId);
  };

  // Get unassigned incoming orders
  const incomingOrders = filteredActiveOrders.filter((o) => !orderAreaMap[o.orderId]);

  // Add a new Area
  const handleAddArea = () => {
    if (!newAreaName.trim()) return;
    const newArea: AreaCluster = {
      id: `area-${Date.now()}`,
      name: newAreaName.trim(),
      assignedRiderId: null,
    };
    setAreas((prev) => [...prev, newArea]);
    setNewAreaName('');
    setShowAddAreaModal(false);
  };

  // Delete an Area
  const handleDeleteArea = (areaId: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== areaId));
    setOrderAreaMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((orderId) => {
        if (next[orderId] === areaId) delete next[orderId];
      });
      return next;
    });
  };

  // Move Order to Area
  const moveOrderToArea = (orderId: string, areaId: string | null) => {
    setOrderAreaMap((prev) => {
      const next = { ...prev };
      if (areaId === null) {
        delete next[orderId];
      } else {
        next[orderId] = areaId;
      }
      return next;
    });

    if (areaId) {
      const area = areas.find((a) => a.id === areaId);
      if (area?.assignedRiderId) {
        onAssignPartnerToOrder(orderId, area.assignedRiderId);
      } else {
        onUpdateOrderStatus(orderId, 'packed');
      }
    } else {
      onUpdateOrderStatus(orderId, 'confirmed');
    }
  };

  // Assign Rider to an Area (Mass Assignment of all orders in that area!)
  const assignRiderToArea = (areaId: string, riderId: string | null) => {
    setAreas((prev) =>
      prev.map((a) => (a.id === areaId ? { ...a, assignedRiderId: riderId } : a))
    );

    if (riderId) {
      const ordersInArea = getOrdersInArea(areaId);
      ordersInArea.forEach((order) => {
        onAssignPartnerToOrder(order.orderId, riderId);
      });
      onToggleRiderStatus(riderId, 'on_delivery');
    }
  };

  // HTML5 Drag Handlers
  const handleDragStartOrder = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('text/plain', orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropZone !== zoneId) {
      setActiveDropZone(zoneId);
    }
  };

  const handleDropOnArea = (e: React.DragEvent, areaId: string) => {
    e.preventDefault();
    setActiveDropZone(null);
    if (draggedOrderId) {
      moveOrderToArea(draggedOrderId, areaId);
      setDraggedOrderId(null);
    }
  };

  const handleDropOnIncoming = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDropZone(null);
    if (draggedOrderId) {
      moveOrderToArea(draggedOrderId, null);
      setDraggedOrderId(null);
    }
  };

  const handleDropOnRider = (e: React.DragEvent, riderId: string) => {
    e.preventDefault();
    setActiveDropZone(null);

    if (draggedAreaId) {
      assignRiderToArea(draggedAreaId, riderId);
      setDraggedAreaId(null);
    } else if (draggedOrderId) {
      onAssignPartnerToOrder(draggedOrderId, riderId);
      setDraggedOrderId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      {/* ── CONTROL BAR ─────────────────────────────────────── */}
      <div className="bg-[#FAF7F2] border border-[#EACFA5] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#8B1A1A] text-[#FAF7F2]"><Truck className="w-5 h-5" /></span>
            <h2 className="font-display font-bold text-xl text-[#2C1810]">Madurai Dispatch Board</h2>
          </div>
          <p className="font-sans text-xs text-black/60">
            Drag incoming orders into areas below. Assign areas to riders to bulk-assign orders instantly!
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, customer, pin..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#EACFA5] text-xs font-sans focus:outline-none focus:border-[#8B1A1A] transition-all"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAddAreaModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Area</span>
          </button>
        </div>
      </div>

      {/* ══ SECTION 1 (TOP): INCOMING UNASSIGNED ORDERS ══ */}
      <div
        onDragOver={(e) => handleDragOver(e, 'incoming')}
        onDrop={handleDropOnIncoming}
        className={`w-full rounded-2xl p-4 sm:p-5 border transition-all flex flex-col gap-3 ${
          activeDropZone === 'incoming'
            ? 'bg-amber-100/70 border-amber-500 border-dashed ring-2 ring-amber-400/40'
            : 'bg-[#F5EEE1]/90 border-[#EACFA5]'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-black/10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8B1A1A]" />
            <h3 className="font-display font-bold text-base text-[#2C1810]">Incoming Unassigned Orders</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#8B1A1A] text-white text-xs font-mono font-bold">
              {incomingOrders.length}
            </span>
          </div>
          <span className="text-xs text-black/50 font-sans italic">
            Drag any order card into an area column below
          </span>
        </div>

        {/* Incoming Cards: Single Horizontal Slide Row */}
        {incomingOrders.length > 0 ? (
          <div className="flex gap-3.5 overflow-x-auto pb-2 pt-0.5 snap-x select-none w-full">
            {incomingOrders.map((order) => (
              <div key={order.orderId} className="min-w-[260px] max-w-[280px] shrink-0 snap-start">
                <OrderKanbanCard
                  order={order}
                  areas={areas}
                  onDragStart={(e) => handleDragStartOrder(e, order.orderId)}
                  onMoveToArea={(areaId) => moveOrderToArea(order.orderId, areaId)}
                  onNavigateToTrackOrder={onNavigateToTrackOrder}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-black/50 italic flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>All incoming orders have been clustered into delivery areas!</span>
          </div>
        )}
      </div>

      {/* ══ SECTION 2 (CENTER): 5 AREA COLUMNS (NO HORIZONTAL SCROLL) ══ */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-display font-bold text-base text-[#2C1810]">
              Madurai Delivery Areas ({areas.length} Clusters)
            </h3>
          </div>
          <span className="text-xs text-black/50 font-sans italic">
            5 clusters per row — extra clusters wrap down automatically
          </span>
        </div>

        {/* 5 Area Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full items-start">
          {areas.map((area) => {
            const areaOrders = getOrdersInArea(area.id);
            const assignedRider = riders.find((r) => r.id === area.assignedRiderId);
            const areaTotal = areaOrders.reduce((sum, o) => sum + o.total, 0);

            return (
              <div
                key={area.id}
                onDragOver={(e) => handleDragOver(e, area.id)}
                onDrop={(e) => handleDropOnArea(e, area.id)}
                className={`w-full rounded-2xl p-4 flex flex-col gap-3 border transition-all ${
                  activeDropZone === area.id
                    ? 'bg-amber-100/90 border-[#D4AF37] border-dashed ring-2 ring-[#D4AF37]/50 scale-[1.01]'
                    : 'bg-white border-[#EACFA5] shadow-xs'
                }`}
              >
                {/* Area Header */}
                <div className="flex flex-col gap-2 pb-2.5 border-b border-[#EACFA5]">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 font-display font-bold text-sm text-[#8B1A1A] truncate">
                      <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{area.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteArea(area.id)}
                      className="p-1 text-black/40 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                      title="Delete Area Cluster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-sans text-black/70">
                    <span className="font-semibold">{areaOrders.length} Orders</span>
                    <span className="font-bold text-[#8B1A1A]">₹{areaTotal}</span>
                  </div>

                  {/* Rider Assignment Dropdown / Drag Badge */}
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedAreaId(area.id);
                      e.dataTransfer.setData('text/plain', area.id);
                    }}
                    className={`p-2 rounded-xl flex items-center justify-between gap-2 border cursor-grab active:cursor-grabbing transition-all ${
                      assignedRider
                        ? 'bg-[#F5EEE1] border-[#D4AF37]/40 text-[#2C1810]'
                        : 'bg-amber-50/50 border-amber-200 border-dashed text-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {assignedRider ? (
                        <>
                          <img src={assignedRider.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[#D4AF37]" />
                          <div className="flex flex-col min-w-0 text-left">
                            <span className="font-bold text-xs truncate leading-none">{assignedRider.name}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold leading-tight">Assigned Fleet</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-amber-800 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Rider:</span>
                        </div>
                      )}
                    </div>

                    <select
                      value={area.assignedRiderId || ''}
                      onChange={(e) => assignRiderToArea(area.id, e.target.value || null)}
                      className="text-[11px] font-sans font-bold py-1 px-1.5 rounded-lg bg-white border border-[#EACFA5] text-[#2C1810] focus:outline-none cursor-pointer max-w-[130px]"
                    >
                      <option value="">-- No Rider --</option>
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clustered Orders inside Area */}
                <div className="flex flex-col gap-3 min-h-[160px] max-h-[480px] overflow-y-auto pr-1">
                  {areaOrders.length > 0 ? (
                    areaOrders.map((order) => (
                      <OrderKanbanCard
                        key={order.orderId}
                        order={order}
                        areas={areas}
                        onDragStart={(e) => handleDragStartOrder(e, order.orderId)}
                        onMoveToArea={(targetAreaId) => moveOrderToArea(order.orderId, targetAreaId)}
                        onNavigateToTrackOrder={onNavigateToTrackOrder}
                      />
                    ))
                  ) : (
                    <div className="py-10 text-center text-xs text-black/40 italic flex flex-col items-center justify-center gap-1 border-2 border-dashed border-black/5 rounded-xl">
                      <span>Drop orders here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ SECTION 3 (BOTTOM): MADURAI DELIVERY FLEET (RIDERS) ══ */}
      <div className="w-full bg-[#FAF7F2] border border-[#EACFA5] rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EACFA5]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#8B1A1A]" />
            <h3 className="font-display font-bold text-base text-[#2C1810]">
              Madurai Delivery Fleet ({riders.length} Riders)
            </h3>
          </div>
          <span className="text-xs text-black/60 font-sans italic">
            Drag an Area Column down onto any Rider card below to mass-assign!
          </span>
        </div>

        {/* 5 Riders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
          {riders.map((rider) => {
            const assignedAreas = areas.filter((a) => a.assignedRiderId === rider.id);
            const totalRiderOrders = orders.filter(
              (o) => o.assignedPartner?.id === rider.id && o.status !== 'delivered' && o.status !== 'cancelled'
            ).length;

            return (
              <div
                key={rider.id}
                onDragOver={(e) => handleDragOver(e, `rider-${rider.id}`)}
                onDrop={(e) => handleDropOnRider(e, rider.id)}
                className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                  activeDropZone === `rider-${rider.id}`
                    ? 'bg-amber-100 border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-[1.02]'
                    : 'bg-white border-[#EACFA5] hover:border-[#D4AF37]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={rider.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-[#D4AF37] shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-display font-bold text-xs text-[#2C1810] truncate">{rider.name}</span>
                      <a href={`tel:${rider.phone}`} className="text-[10px] text-[#8B1A1A] hover:underline flex items-center gap-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{rider.phone}</span>
                      </a>
                    </div>
                  </div>

                  <select
                    value={rider.status}
                    onChange={(e) => onToggleRiderStatus(rider.id, e.target.value as any)}
                    className={`text-[9px] font-sans font-bold py-0.5 px-1.5 rounded-full focus:outline-none cursor-pointer ${
                      rider.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : rider.status === 'on_delivery'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="on_delivery">On Delivery</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EACFA5]/60 text-xs">
                  <div className="flex items-center gap-1 flex-wrap">
                    {assignedAreas.length > 0 ? (
                      assignedAreas.map((a) => (
                        <span key={a.id} className="px-1.5 py-0.5 rounded-md bg-[#F5EEE1] border border-[#EACFA5] font-bold text-[9px] text-[#8B1A1A]">
                          {a.name.split(' ')[0]}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-black/40 italic">No Area</span>
                    )}
                  </div>

                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#8B1A1A] text-white">
                    {totalRiderOrders} Orders
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD CUSTOM AREA MODAL ────────────────────────────── */}
      {showAddAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-2xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <button type="button" onClick={() => setShowAddAreaModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-[#8B1A1A]">
              <MapPin className="w-6 h-6 text-[#D4AF37]" />
              <h3 className="font-display font-bold text-xl">Create Custom Delivery Area</h3>
            </div>
            <p className="text-xs text-black/70">
              Enter a name for the new Madurai delivery cluster (e.g. "North Madurai", "KK Nagar Zone").
            </p>
            <input
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              placeholder="e.g. North Madurai"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EACFA5] text-sm focus:outline-none focus:border-[#8B1A1A]"
              autoFocus
            />
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => setShowAddAreaModal(false)} className="flex-1 py-2.5 rounded-xl border border-black/20 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleAddArea} className="flex-1 py-2.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-bold text-xs transition-all shadow-md cursor-pointer">
                Create Area
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── KANBAN ORDER CARD COMPONENT ──────────────────────────────
interface OrderKanbanCardProps {
  order: OrderSnapshot;
  areas: AreaCluster[];
  onDragStart: (e: React.DragEvent) => void;
  onMoveToArea: (areaId: string | null) => void;
  onNavigateToTrackOrder?: (orderId: string) => void;
}

const OrderKanbanCard: FC<OrderKanbanCardProps> = ({
  order,
  areas,
  onDragStart,
  onMoveToArea,
  onNavigateToTrackOrder,
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="p-3.5 rounded-xl bg-white border border-[#EACFA5] hover:border-[#D4AF37] shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2 cursor-grab active:cursor-grabbing group relative"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-black/30 group-hover:text-black/60 shrink-0" />
          <span className="font-mono font-bold text-xs text-[#8B1A1A]">{order.orderId}</span>
        </div>
        <span className="font-mono font-bold text-xs text-[#2C1810]">₹{order.total}</span>
      </div>

      <div className="flex flex-col text-xs text-black/80">
        <span className="font-bold text-[#2C1810] truncate">{order.customerName || 'Customer'}</span>
        <span className="text-[11px] text-black/60 line-clamp-2 leading-tight mt-0.5">
          {order.address?.fullAddress || 'Madurai Address'}
        </span>
        {order.address?.pincode && (
          <span className="mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F5EEE1] text-[#8B1A1A] border border-[#EACFA5] w-fit">
            Pin: {order.address.pincode}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[11px] text-black/60 font-sans">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
          order.status === 'out_for_delivery'
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : order.status === 'packed'
            ? 'bg-blue-100 text-blue-900 border border-blue-300'
            : order.status === 'delivered'
            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {order.status.replace(/_/g, ' ')}
        </span>
        <span className="truncate max-w-[110px] font-mono text-[10px]">{order.slot?.timeWindow || 'Today'}</span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-black/5">
        <select
          onChange={(e) => onMoveToArea(e.target.value === 'incoming' ? null : e.target.value)}
          defaultValue=""
          className="text-[10px] font-sans font-semibold py-1 px-1.5 rounded-md bg-[#FAF7F2] border border-[#EACFA5] text-[#2C1810] focus:outline-none cursor-pointer w-full"
        >
          <option value="" disabled>Move Area...</option>
          <option value="incoming">Incoming (Unassigned)</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              👉 {a.name}
            </option>
          ))}
        </select>
        {onNavigateToTrackOrder && (
          <button
            type="button"
            onClick={() => onNavigateToTrackOrder(order.orderId)}
            className="p-1 rounded-md text-black/40 hover:text-[#8B1A1A] hover:bg-black/5 transition-colors cursor-pointer shrink-0"
            title="Track Live"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
