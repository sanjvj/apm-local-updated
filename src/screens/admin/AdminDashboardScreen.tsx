import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useMenu } from '../../context/MenuContext';
import { useAuth } from '../../context/AuthContext';
import { useSlots } from '../../context/SlotContext';
import type { OrderStatus, DeliveryPartner } from '../../types/delivery';
import type { OrderSnapshot } from '../../types/order';
import type { MenuItem, CategoryId } from '../../types/menu';
import type { DeliverySlot } from '../../types/slot';
import { MenuItemModal, SlotModal, ConfirmDialog, BrandLogo, DispatchBoard, RiderModal } from '../../components';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Clock,
  CheckCircle2,
  Package,
  IndianRupee,
  Search,
  Filter,
  X,
  Phone,
  Eye,
  Store,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Save,
  RotateCcw,
  MapPin,
  UserCheck,
  Check,
  Star,
  AlertCircle,
} from 'lucide-react';

export interface AdminDashboardScreenProps {
  onExitToStore: () => void;
  onNavigateToTrackOrder?: (orderId: string) => void;
}

export const AdminDashboardScreen: FC<AdminDashboardScreenProps> = ({
  onExitToStore,
  onNavigateToTrackOrder,
}) => {
  const { adminLogout, adminEmail } = useAuth();

  const {
    allOrders,
    deliveryPartners,
    clusterRequests = [],
    approveClusterRequest,
    rejectClusterRequest,
    updateOrderStatus,
    assignPartnerToOrder,
    togglePartnerStatus,
    addDeliveryPartner,
    updateDeliveryPartner,
    deleteDeliveryPartner,
  } = useOrders();

  const {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleStockStatus,
  } = useMenu();

  const {
    slots,
    addSlot,
    updateSlot,
    deleteSlot,
    resetAllSlotsToCapacity,
  } = useSlots();

  const [activeTab, setActiveTab] = useState<'overview' | 'dispatch' | 'requests' | 'orders' | 'riders' | 'slots' | 'stock'>('dispatch');
  const [selectedOrder, setSelectedOrder] = useState<OrderSnapshot | null>(null);
  const [modalStatus, setModalStatus] = useState<OrderStatus>('confirmed');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync modal state when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      setModalStatus(selectedOrder.status);
    }
  }, [selectedOrder]);

  // Delivery Partner Management Local State
  const [editingRider, setEditingRider] = useState<DeliveryPartner | null>(null);
  const [isAddRiderModalOpen, setIsAddRiderModalOpen] = useState<boolean>(false);
  const [deletingRiderId, setDeletingRiderId] = useState<string | null>(null);

  // Menu Management Local State
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<CategoryId>('all');
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingMenuItemId, setDeletingMenuItemId] = useState<string | null>(null);

  // Slot Management Local State
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState<boolean>(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  // Calculate Overview KPIs
  const totalOrdersCount = allOrders.length;
  const activeOrdersCount = allOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;
  const deliveredCount = allOrders.filter((o) => o.status === 'delivered').length;
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

  // Filtered orders list
  const filteredOrders = allOrders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.address?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.address?.fullAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered menu items list
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = menuCategoryFilter === 'all' || item.category === menuCategoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      item.meta.toLowerCase().includes(menuSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const itemToDelete = menuItems.find((i) => i.id === deletingMenuItemId);
  const slotToDelete = slots.find((s) => s.id === deletingSlotId);
  const riderToDelete = deliveryPartners.find((r) => r.id === deletingRiderId);

  const handleSaveOrderChanges = () => {
    if (!selectedOrder) return;

    // Update Order Status manually
    updateOrderStatus(selectedOrder.orderId, modalStatus);

    // Close modal
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col select-none">
      {/* Top Admin Header Bar */}
      <header className="bg-[var(--mahogany)] text-white py-3.5 px-4 sm:px-8 border-b border-white/10 sticky top-0 z-50 shadow-md">
        <div className="max-w-[1920px] w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="full" badgeSize="sm" theme="light" />
            <span className="font-mono text-[10px] bg-[var(--gold)] text-[var(--mahogany)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ADMIN CONTROL
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline font-mono text-xs text-[var(--gold)]">
              {adminEmail || 'admin@annapoornamithai.com'}
            </span>

            {/* Exit to Customer Store Button */}
            <button
              type="button"
              onClick={onExitToStore}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-white
                font-sans font-semibold text-xs hover:bg-white/25 transition-all cursor-pointer border border-white/10
              "
            >
              <Store className="w-4 h-4 stroke-[2]" />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={adminLogout}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-700/80 text-white
                font-sans font-bold text-xs hover:bg-red-800 transition-all cursor-pointer shadow-2xs border border-red-500/30
              "
              title="Sign out of Admin Panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 sticky top-[61px] z-40 shadow-2xs">
        <div className="max-w-[1920px] w-full mx-auto flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'dispatch', label: 'Dispatch Board 🗺️', icon: MapPin },
            { id: 'requests', label: `Rider Requests (${clusterRequests.filter((r) => r.status === 'pending').length}) 🙋‍♂️`, icon: UserCheck },
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: `Orders (${activeOrdersCount} active)`, icon: ShoppingBag },
            { id: 'slots', label: `Delivery Slots (${slots.length})`, icon: Clock },
            { id: 'stock', label: `Menu Items (${menuItems.length})`, icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0
                  ${
                    isActive
                      ? 'bg-[var(--crimson)] text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Dashboard Body */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">

        {/* TAB: KANBAN DISPATCH BOARD */}
        {activeTab === 'dispatch' && (
          <DispatchBoard
            orders={allOrders}
            riders={deliveryPartners}
            onAssignPartnerToOrder={assignPartnerToOrder}
            onUpdateOrderStatus={updateOrderStatus}
            onToggleRiderStatus={togglePartnerStatus}
            onNavigateToTrackOrder={onNavigateToTrackOrder}
          />
        )}

        {/* TAB: RIDER CLUSTER REQUESTS APPROVAL */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="font-display font-bold text-xl text-gray-900">
                  Gig Rider Cluster Bidding Requests
                </h2>
                <p className="text-xs font-sans text-gray-500">
                  Review applicant riders who requested delivery clusters. Approving a rider assigns the cluster and automatically deletes all competing requests.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                {clusterRequests.filter((r) => r.status === 'pending').length} Pending Requests
              </span>
            </div>

            {clusterRequests.filter((r) => r.status === 'pending').length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
                <UserCheck className="w-12 h-12 text-gray-300 stroke-[1.5]" />
                <h3 className="font-display font-bold text-base text-gray-800">No Pending Requests</h3>
                <p className="text-xs font-sans text-gray-500 max-w-sm">
                  When gig riders request available delivery clusters from the Rider Portal, their applications will appear here for your approval.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {clusterRequests
                  .filter((r) => r.status === 'pending')
                  .map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border-2 border-amber-300 p-5 flex flex-col justify-between gap-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Header: Requested Payout & Time */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                            💰 Payout: ₹{req.payoutAmount}
                          </span>
                          <span className="font-mono text-[10px] text-gray-500 font-semibold">
                            Requested at {req.requestedAt}
                          </span>
                        </div>

                        {/* Rider Applicant Info */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--crimson)] text-[var(--gold)] flex items-center justify-center font-bold text-base shrink-0 shadow-xs border-2 border-[var(--gold)]">
                            {req.riderName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="font-display font-bold text-base text-gray-900 truncate">
                              {req.riderName}
                            </h4>
                            <span className="font-sans text-xs text-gray-600">
                              📞 {req.riderPhone}
                            </span>
                            <span className="font-mono text-[11px] text-gray-500 mt-0.5">
                              🛵 {req.vehicleType} ({req.vehicleNo})
                            </span>
                          </div>
                        </div>

                        {/* Cluster Info Box */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-1 text-xs font-sans">
                          <div className="flex items-center justify-between text-amber-900 font-bold">
                            <span>Requested Cluster Batch:</span>
                            <span className="font-mono text-sm">{req.ordersCount} Orders</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-800">
                            <span>Route Distance:</span>
                            <span className="font-mono font-semibold">{req.totalDistanceKm} km</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-800">
                            <span>Guaranteed Payout Rate:</span>
                            <span className="font-mono font-semibold">₹50 / order</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => rejectClusterRequest(req.id)}
                          className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => approveClusterRequest(req.id)}
                          className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1 border border-emerald-500/30"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Assign</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            {/* KPI Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">Total Orders</span>
                  <span className="font-mono text-3xl font-bold text-gray-900 mt-1">{totalOrdersCount}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[var(--crimson)] flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">Active Deliveries</span>
                  <span className="font-mono text-3xl font-bold text-[var(--gold-dark)] mt-1">{activeOrdersCount}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[var(--gold-dark)] flex items-center justify-center">
                  <Truck className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">Revenue Today</span>
                  <span className="font-mono text-3xl font-bold text-emerald-700 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">Delivered</span>
                  <span className="font-mono text-3xl font-bold text-gray-900 mt-1">{deliveredCount}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Active Orders Quick Feed Table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-gray-900">
                  Recent Orders Feed
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-sans font-bold text-[var(--crimson)] hover:underline cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-gray-50 text-gray-500 font-mono uppercase text-[11px] border-y border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Slot</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Delivery Boy</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {allOrders.map((o) => (
                      <tr key={o.orderId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[var(--crimson)]">{o.orderId}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{o.customerName || o.address?.fullName || 'Customer'}</span>
                            <span className="text-[11px] text-gray-500">{o.address?.fullAddress.slice(0, 25)}...</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-700">{o.slot?.timeWindow}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          {o.assignedPartner ? (
                            <span className="font-bold text-gray-800">{o.assignedPartner.name}</span>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">₹{o.total}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1 rounded-lg bg-[var(--crimson)] text-white text-xs font-bold hover:bg-[var(--crimson-dark)] transition-all cursor-pointer shadow-2xs"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                {['all', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0
                      ${
                        statusFilter === st
                          ? 'bg-[var(--mahogany)] text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer name, ID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-gray-50 text-gray-500 font-mono uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Items</th>
                      <th className="py-3.5 px-4">Customer & Address</th>
                      <th className="py-3.5 px-4">Slot</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Rider</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredOrders.map((o) => (
                      <tr key={o.orderId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[var(--crimson)]">{o.orderId}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            {o.items.map(({ item, quantity }) => (
                              <span key={item.id} className="text-gray-800 text-[11px]">
                                {item.name} × {quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{o.customerName || o.address?.fullName || 'Customer'}</span>
                            <span className="text-[11px] text-gray-500">{o.address?.fullAddress}</span>
                            <span className="font-mono text-[10px] text-gray-400">{o.address?.contactNumber}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-700">{o.slot?.timeWindow}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 w-fit">
                              {o.status.replace(/_/g, ' ')}
                            </span>
                            {o.complaint && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-600 text-white flex items-center gap-1 w-fit animate-pulse">
                                ⚠️ Complaint ({o.complaint.category})
                              </span>
                            )}
                            {o.feedback && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 w-fit">
                                ⭐ {o.feedback.rating}★ Review
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {o.assignedPartner ? (
                            <span className="font-bold text-gray-800">{o.assignedPartner.name}</span>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">₹{o.total}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="px-3 py-1 rounded-lg bg-[var(--crimson)] text-white text-xs font-bold hover:bg-[var(--crimson-dark)] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Manage</span>
                            </button>
                            {onNavigateToTrackOrder && (
                              <button
                                type="button"
                                onClick={() => onNavigateToTrackOrder(o.orderId)}
                                className="px-2.5 py-1 rounded-lg bg-[var(--gold)] text-[var(--mahogany)] font-bold text-xs hover:bg-[var(--gold-dark)] transition-all cursor-pointer"
                              >
                                Live Track
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERY BOYS MANAGEMENT */}
        {activeTab === 'riders' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="flex flex-col">
                <h3 className="font-display font-bold text-2xl text-gray-900">
                  Madurai Delivery Fleet ({deliveryPartners.length} Members)
                </h3>
                <p className="font-sans text-xs text-gray-500">
                  Add, edit rider profiles, manage vehicle info, or update duty status
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddRiderModalOpen(true)}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--crimson)] text-white
                  font-sans font-bold text-xs sm:text-sm hover:bg-[var(--crimson-dark)] transition-all cursor-pointer shadow-md shrink-0
                "
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add New Delivery Guy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {deliveryPartners.map((partner) => (
                <div key={partner.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--mahogany)] text-[var(--gold)] font-serif font-bold text-xl flex items-center justify-center shrink-0 border-2 border-[var(--gold)]">
                          {partner.avatar}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-sans font-bold text-base text-gray-900">{partner.name}</h4>
                          <span className="font-mono text-xs text-gray-500">{partner.vehicleType}</span>
                          <span className="font-mono text-[11px] font-bold text-[var(--crimson)]">{partner.vehicleNo}</span>
                        </div>
                      </div>

                      <a
                        href={`tel:${partner.phone}`}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Call Rider"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-500">Current Area:</span>
                      <span className="font-sans font-bold text-gray-800">{partner.currentArea || 'Madurai Hub'}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                      <span className="font-mono text-gray-500">Active Deliveries:</span>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {partner.activeOrdersCount || 0} assigned
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono text-gray-500">Duty Status:</span>
                      <select
                        value={partner.status}
                        onChange={(e) => togglePartnerStatus(partner.id, e.target.value as any)}
                        className={`
                          px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer focus:outline-none
                          ${
                            partner.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : partner.status === 'on_delivery'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                          }
                        `}
                      >
                        <option value="available">Available</option>
                        <option value="on_delivery">On Delivery</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingRider(partner)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-sans font-semibold transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingRiderId(partner.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-sans font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DYNAMIC DELIVERY SLOTS CONTROL & CRUD */}
        {activeTab === 'slots' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="flex flex-col">
                <h3 className="font-display font-bold text-2xl text-gray-900">
                  Madurai Delivery Windows ({slots.length} Active Slots)
                </h3>
                <p className="font-sans text-xs text-gray-500">
                  Manage timing windows, cutoff times, max capacities, or trigger fresh daily resets
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Reset Daily Capacities Button */}
                <button
                  type="button"
                  onClick={resetAllSlotsToCapacity}
                  className="
                    flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300
                    font-sans font-bold text-xs hover:bg-amber-100 transition-all cursor-pointer shadow-2xs
                  "
                  title="Reset booked counts for all slots back to max capacity at start of day"
                >
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Reset Daily Capacities</span>
                </button>

                {/* Add New Slot Button */}
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(true)}
                  className="
                    flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--crimson)] text-white
                    font-sans font-bold text-xs sm:text-sm hover:bg-[var(--crimson-dark)] transition-all cursor-pointer shadow-md
                  "
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Add New Slot</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {slots.map((slot) => {
                const spotsLeft = Math.max(0, slot.capacity - slot.filled);

                return (
                  <div key={slot.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-[var(--gold-dark)]" />
                          <h4 className="font-display font-bold text-lg text-gray-900">{slot.timeWindow}</h4>
                        </div>
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          {slot.cutoffLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span>Booked Today:</span>
                        <span className="font-bold text-gray-900">{slot.filled} orders</span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span>Remaining Capacity:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-md ${spotsLeft > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                          {spotsLeft} of {slot.capacity} spots left
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingSlot(slot)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-sans font-semibold transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingSlotId(slot.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-sans font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: COMPLETE MENU ITEMS & STOCK MANAGEMENT */}
        {activeTab === 'stock' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="flex flex-col">
                <h3 className="font-display font-bold text-2xl text-gray-900">
                  Menu Management ({menuItems.length} Items)
                </h3>
                <p className="font-sans text-xs text-gray-500">
                  Add, edit, upload images, update prices, or delete items on the storefront
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--crimson)] text-white
                  font-sans font-bold text-xs sm:text-sm hover:bg-[var(--crimson-dark)] transition-all cursor-pointer shadow-md shrink-0
                "
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add New Menu Item</span>
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'ghewar', label: 'Ghewar' },
                  { id: 'sweets', label: 'Sweets' },
                  { id: 'beverages', label: 'Beverages' },
                  { id: 'snacks', label: 'Snacks' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setMenuCategoryFilter(c.id as CategoryId)}
                    className={`
                      px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer shrink-0
                      ${
                        menuCategoryFilter === c.id
                          ? 'bg-[var(--mahogany)] text-white shadow-2xs font-bold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  placeholder="Search item name or weight..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMenuItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className="w-16 h-16 rounded-xl aspect-square shrink-0 overflow-hidden flex items-center justify-center text-white font-serif font-bold text-sm shadow-2xs relative border border-gray-200"
                      style={{ background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})` }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{item.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <span className="font-mono font-bold text-base text-[var(--crimson)]">
                          ₹{item.price}
                        </span>
                      </div>

                      <h4 className="font-sans font-bold text-base text-gray-900 mt-1 truncate" title={item.name}>
                        {item.name}
                      </h4>

                      <span className="font-sans text-xs text-gray-500">{item.meta}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleStockStatus(item.id)}
                      className={`
                        px-3 py-1 rounded-xl text-[11px] font-mono font-bold uppercase transition-all cursor-pointer
                        ${
                          item.isOutOfStock
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }
                      `}
                    >
                      {item.isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMenuItem(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-sans font-semibold transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingMenuItemId(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-sans font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Order Detail & Status Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 relative animate-scale-in">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <ShoppingBag className="w-5 h-5 text-[var(--crimson)]" />
              <h3 className="font-display font-bold text-xl text-gray-900">
                Manage Order {selectedOrder.orderId}
              </h3>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl flex flex-col gap-1 text-xs">
              <span className="font-bold text-gray-900 text-sm">
                👤 Customer: {selectedOrder.customerName || selectedOrder.address?.fullName || 'Customer'}
              </span>
              <span className="text-gray-600">📍 Address: {selectedOrder.address?.fullAddress}</span>
              <span className="font-mono text-gray-500">📞 Phone: {selectedOrder.address?.contactNumber}</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold text-gray-500 uppercase">Items Ordered</span>
              {selectedOrder.items.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between items-center text-xs font-sans">
                  <span>{item.name} × {quantity}</span>
                  <span className="font-mono font-bold">₹{item.price * quantity}</span>
                </div>
              ))}
            </div>

            {/* Customer Complaint Display with Mandatory Photo Proof */}
            {selectedOrder.complaint && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-xs text-rose-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>CUSTOMER COMPLAINT FILED ({selectedOrder.complaint.category})</span>
                  </span>
                  <span className="font-mono text-[10px] text-rose-800 font-bold bg-rose-200 px-2 py-0.5 rounded-full uppercase">
                    {selectedOrder.complaint.status}
                  </span>
                </div>
                <p className="text-xs font-sans text-rose-950 bg-white p-2.5 rounded-lg border border-rose-200">
                  "{selectedOrder.complaint.description}"
                </p>

                {selectedOrder.complaint.imageUrl && (
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="font-mono text-[10px] font-bold text-rose-800 uppercase">Uploaded Photo Proof:</span>
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-rose-300 bg-black/5">
                      <img
                        src={selectedOrder.complaint.imageUrl}
                        alt="Customer Complaint Proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customer Rating & Review Display */}
            {selectedOrder.feedback && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col gap-1.5 text-xs font-sans text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Customer Rating: {selectedOrder.feedback.rating} / 5 Stars</span>
                  </span>
                </div>
                {selectedOrder.feedback.comment && (
                  <p className="italic text-amber-900 bg-white/70 p-2 rounded-lg border border-amber-200">
                    "{selectedOrder.feedback.comment}"
                  </p>
                )}
              </div>
            )}

            {/* Editable Status Controls */}
            <div className="flex flex-col gap-1 border-t border-gray-200 pt-3">
              <label htmlFor="modal-order-status" className="text-xs font-mono font-bold text-gray-700">Update Status Manually</label>
              <select
                id="modal-order-status"
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value as OrderStatus)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[var(--gold)] focus:outline-none cursor-pointer"
              >
                <option value="confirmed">Confirmed & Paid</option>
                <option value="packed">Packed at Hub</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Explicit Save Changes Button */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-sans font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOrderChanges}
                className="
                  px-5 py-2.5 rounded-xl bg-[var(--crimson)] text-white text-xs font-sans font-bold
                  hover:bg-[var(--crimson-dark)] transition-all shadow-md flex items-center gap-1.5 cursor-pointer
                "
              >
                <Save className="w-4 h-4 text-[var(--gold)]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Slot Modal */}
      {isAddSlotModalOpen && (
        <SlotModal
          onSave={(newSlotData) => addSlot(newSlotData)}
          onClose={() => setIsAddSlotModalOpen(false)}
        />
      )}

      {/* Edit Slot Modal */}
      {editingSlot && (
        <SlotModal
          slot={editingSlot}
          onSave={(updatedSlotData) => updateSlot(updatedSlotData as DeliverySlot)}
          onClose={() => setEditingSlot(null)}
        />
      )}

      {/* Delete Slot Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingSlotId !== null}
        title="Delete Delivery Slot?"
        message={`Are you sure you want to delete the slot "${slotToDelete?.timeWindow || 'this slot'}"? It will no longer be available for customer checkout.`}
        confirmLabel="Delete Slot"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (deletingSlotId) {
            deleteSlot(deletingSlotId);
            setDeletingSlotId(null);
          }
        }}
        onCancel={() => setDeletingSlotId(null)}
      />

      {/* Add New Menu Item Modal */}
      {isAddModalOpen && (
        <MenuItemModal
          onSave={(newItem) => addMenuItem(newItem)}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Menu Item Modal */}
      {editingMenuItem && (
        <MenuItemModal
          item={editingMenuItem}
          onSave={(updatedItem) => updateMenuItem(updatedItem)}
          onClose={() => setEditingMenuItem(null)}
        />
      )}

      {/* Custom Confirmation Dialog for Deleting Menu Item */}
      <ConfirmDialog
        isOpen={deletingMenuItemId !== null}
        title="Delete Menu Item?"
        message={`Are you sure you want to delete "${itemToDelete?.name || 'this item'}" from the menu? It will be removed from the customer storefront.`}
        confirmLabel="Delete Item"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (deletingMenuItemId) {
            deleteMenuItem(deletingMenuItemId);
            setDeletingMenuItemId(null);
          }
        }}
        onCancel={() => setDeletingMenuItemId(null)}
      />

      {/* Add New Delivery Guy Modal */}
      {isAddRiderModalOpen && (
        <RiderModal
          onSave={(newRiderData) => addDeliveryPartner(newRiderData)}
          onClose={() => setIsAddRiderModalOpen(false)}
        />
      )}

      {/* Edit Delivery Guy Modal */}
      {editingRider && (
        <RiderModal
          rider={editingRider}
          onSave={(updatedRiderData) => updateDeliveryPartner(updatedRiderData)}
          onClose={() => setEditingRider(null)}
        />
      )}

      {/* Delete Delivery Guy Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingRiderId !== null}
        title="Delete Delivery Guy?"
        message={`Are you sure you want to delete "${riderToDelete?.name || 'this rider'}" from the fleet? They will be removed from dispatch assignments.`}
        confirmLabel="Delete Rider"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (deletingRiderId) {
            deleteDeliveryPartner(deletingRiderId);
            setDeletingRiderId(null);
          }
        }}
        onCancel={() => setDeletingRiderId(null)}
      />
    </div>
  );
};
