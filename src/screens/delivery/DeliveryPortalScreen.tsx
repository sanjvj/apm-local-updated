import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useOrders, DEFAULT_ORDER_CLUSTER_MAP } from '../../context/OrderContext';
import type { OrderSnapshot } from '../../types/order';
import type { OrderStatus } from '../../types/delivery';
import { BrandLogo, RiderAuthModal, type GigRiderProfile } from '../../components';
import { optimizeDeliveryRoute, STORE_HUB_LOCATION } from '../../utils/routeOptimizer';
import {
  Phone,
  MapPin,
  Navigation,
  CheckCircle2,
  ShoppingBag,
  Store,
  Search,
  Truck,
  ExternalLink,
  Check,
  Route,
  ArrowRight,
  ShieldCheck,
  LogOut,
  Wallet,
  CheckCircle,
  Users,
  Hourglass,
  Lock,
} from 'lucide-react';

const STORAGE_KEY_CLAIMED_CLUSTERS = 'apm_claimed_rider_clusters';
const STORAGE_KEY_ORDER_AREAS = 'apm_local_delivery_order_area_map';

export interface AvailableClusterBatch {
  id: string;
  orderIds: string[];
  orders: OrderSnapshot[];
  ordersCount: number;
  payoutAmount: number;
  totalDistanceKm: number;
  totalTimeMin: number;
}

export interface DeliveryPortalScreenProps {
  onNavigateToStore?: () => void;
}

export const DeliveryPortalScreen: FC<DeliveryPortalScreenProps> = ({ onNavigateToStore }) => {
  const {
    allOrders,
    clusterRequests = [],
    requestCluster,
    updateOrderStatus,
  } = useOrders();

  // Gig Rider Authentication State
  const [activeGigRider, setActiveGigRider] = useState<GigRiderProfile | null>(() => {
    try {
      const saved = localStorage.getItem('apm_active_gig_rider');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Claimed Clusters per Rider stored in localStorage
  const [claimedClustersMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLAIMED_CLUSTERS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [collectedCashMap, setCollectedCashMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Logout Rider
  const handleRiderLogout = () => {
    localStorage.removeItem('apm_active_gig_rider');
    setActiveGigRider(null);
  };

  // Filter orders for active rider:
  // An order belongs to this rider IF approved by admin (assignedPartner matching rider OR claimed map)
  const myClaimedOrders = useMemo(() => {
    if (!activeGigRider) return [];
    return allOrders.filter((o) => {
      const isClaimedByMe = claimedClustersMap[o.orderId] === activeGigRider.id;
      const isAssignedDirectly =
        o.assignedPartner?.id === activeGigRider.id ||
        (o.assignedPartner?.name && o.assignedPartner.name.toLowerCase() === activeGigRider.name.toLowerCase());
      return isClaimedByMe || isAssignedDirectly;
    });
  }, [allOrders, activeGigRider, claimedClustersMap]);

  // Pending vs Delivered for my approved orders
  const myPendingOrders = useMemo(() => {
    return myClaimedOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  }, [myClaimedOrders]);

  const myDeliveredOrders = useMemo(() => {
    return myClaimedOrders.filter((o) => o.status === 'delivered');
  }, [myClaimedOrders]);

  // VISIBILITY CHECK: Does the rider have an approved confirmed active ride?
  const hasApprovedActiveRide = myPendingOrders.length > 0;

  // Active Tab state: default to 'market' (Available Clusters) if no approved ride!
  const [activeFilter, setActiveFilter] = useState<'market' | 'my_active' | 'completed'>('market');

  // Auto switch tab to 'my_active' if newly approved, or fallback to 'market'
  useEffect(() => {
    if (hasApprovedActiveRide) {
      setActiveFilter('my_active');
    } else if (activeFilter === 'my_active') {
      setActiveFilter('market');
    }
  }, [hasApprovedActiveRide]);

  // Group ALL 5 Madurai Zones & Orders dynamically from Admin Dispatch Board
  const availableClustersList = useMemo(() => {
    const defaultAreasList = [
      { id: 'area-north', name: 'North Madurai', pincodes: ['625002', '625018'] },
      { id: 'area-south', name: 'South Madurai', pincodes: ['625003'] },
      { id: 'area-central', name: 'Central Temple Zone', pincodes: ['625001', '625016'] },
      { id: 'area-east', name: 'East Madurai', pincodes: ['625020', '625017'] },
      { id: 'area-west', name: 'West Madurai (TVS Nagar)', pincodes: ['625016'] },
    ];

    let currentAreas = defaultAreasList;
    try {
      const savedAreas = localStorage.getItem('apm_local_delivery_area_clusters');
      if (savedAreas) {
        const parsed = JSON.parse(savedAreas);
        if (Array.isArray(parsed) && parsed.length > 0) currentAreas = parsed;
      }
    } catch {}

    let areaMap: Record<string, string> = DEFAULT_ORDER_CLUSTER_MAP;
    try {
      const savedMap = localStorage.getItem(STORAGE_KEY_ORDER_AREAS);
      if (savedMap) areaMap = { ...DEFAULT_ORDER_CLUSTER_MAP, ...JSON.parse(savedMap) };
    } catch {}

    // Build cluster batches for zones with active orders ONLY
    return currentAreas
      .map((area) => {
        // Find all active orders in this area
        const zoneOrders = allOrders.filter((o) => {
          const orderZoneId = areaMap[o.orderId] || DEFAULT_ORDER_CLUSTER_MAP[o.orderId] || 'area-central';
          const isPending = o.status !== 'delivered' && o.status !== 'cancelled';
          return isPending && orderZoneId === area.id;
        });

        const routeSummary = optimizeDeliveryRoute(zoneOrders, STORE_HUB_LOCATION);
        const firstAssigned = zoneOrders.find((o) => o.assignedPartner)?.assignedPartner;

        return {
          id: area.id,
          name: area.name,
          orderIds: zoneOrders.map((o) => o.orderId),
          orders: zoneOrders,
          ordersCount: zoneOrders.length,
          payoutAmount: zoneOrders.length * 50,
          totalDistanceKm: routeSummary.totalDistanceKm,
          totalTimeMin: routeSummary.totalTimeMin,
          assignedPartner: firstAssigned,
        };
      })
      .filter((cluster) => cluster.ordersCount > 0);
  }, [allOrders, claimedClustersMap]);

  // SMART ROUTE SEQUENCER for My Approved Claimed Orders starting from Kitchen Hub
  const myRouteSummary = useMemo(() => {
    return optimizeDeliveryRoute(myPendingOrders, STORE_HUB_LOCATION);
  }, [myPendingOrders]);

  // Route metrics for completed orders
  const completedRouteSummary = useMemo(() => {
    return optimizeDeliveryRoute(myDeliveredOrders, STORE_HUB_LOCATION);
  }, [myDeliveredOrders]);

  const currentActiveStop = myRouteSummary.optimizedOrders[0];

  // Calculate Rider Total Earnings Wallet (₹50 per delivered order)
  const myEarnedPayout = myDeliveredOrders.length * 50;

  // Request Cluster Batch Action (Sends request to Admin Panel)
  const handleRequestCluster = (cluster: AvailableClusterBatch) => {
    if (!activeGigRider) return;

    requestCluster(
      cluster.id,
      {
        id: activeGigRider.id,
        name: activeGigRider.name,
        phone: activeGigRider.phone,
        vehicleType: activeGigRider.vehicleType,
        vehicleNo: activeGigRider.vehicleNo,
      },
      cluster.ordersCount,
      cluster.payoutAmount,
      cluster.totalDistanceKm
    );
  };

  // Helper to launch Google Maps Location Pinpoint
  const openGoogleMapsPinpoint = (order: OrderSnapshot) => {
    const address = order.address;
    if (address?.lat && address?.lng) {
      window.open(`https://www.google.com/maps?q=${address.lat},${address.lng}`, '_blank');
    } else if (address?.fullAddress) {
      const query = encodeURIComponent(`${address.fullAddress}, Madurai, Tamil Nadu ${address.pincode || ''}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=Madurai`, '_blank');
    }
  };

  const handleMarkDelivered = (order: OrderSnapshot) => {
    const cashVal = collectedCashMap[order.orderId] ?? order.total;
    const note = `Delivered by Gig Rider ${activeGigRider?.name || 'Rider'}. Cash collected: ₹${cashVal}`;
    updateOrderStatus(order.orderId, 'delivered', note);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus} by ${activeGigRider?.name || 'Rider'}`);
  };

  // Filter list based on search
  const displayedPendingOrders = useMemo(() => {
    const list = myRouteSummary.optimizedOrders;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((o) =>
      o.orderId.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.address?.fullAddress.toLowerCase().includes(q) ||
      o.address?.pincode?.includes(q)
    );
  }, [myRouteSummary, searchQuery]);

  // If rider is NOT logged in, render Signup / Login Modal!
  if (!activeGigRider) {
    return <RiderAuthModal onLoginSuccess={(rider) => setActiveGigRider(rider)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col overflow-x-hidden select-none">
      {/* Header Bar */}
      <header className="bg-[var(--mahogany)] text-[var(--ivory)] px-3 sm:px-8 py-2.5 sm:py-3.5 sticky top-0 z-50 border-b border-white/10 shadow-md">
        <div className="max-w-[1920px] w-full mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <BrandLogo variant="full" badgeSize="sm" theme="light" />
            <span className="hidden sm:inline font-mono text-[10px] bg-[var(--gold)] text-[var(--mahogany)] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
              RIDER GIG PORTAL
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Active Rider Profile Badge */}
            <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-xs font-semibold text-white py-1 px-2.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[100px] sm:max-w-[140px] font-sans">
                {activeGigRider.name}
              </span>
            </div>

            {/* Rider Logout Button */}
            <button
              type="button"
              onClick={handleRiderLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-red-700/80 text-white font-sans font-bold text-xs hover:bg-red-800 transition-all cursor-pointer shadow-2xs border border-red-500/30 flex items-center gap-1"
              title="Logout Rider Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Exit to Customer Store Button */}
            {onNavigateToStore && (
              <button
                type="button"
                onClick={onNavigateToStore}
                className="
                  flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 text-white
                  font-sans font-semibold text-xs hover:bg-white/25 transition-all cursor-pointer border border-white/10 shrink-0
                "
              >
                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                <span className="hidden sm:inline">Storefront</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-8 sticky top-[51px] sm:top-[61px] z-40 shadow-2xs">
        <div className="max-w-[1920px] w-full mx-auto flex items-center justify-between py-2 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-2">
            {/* Available Clusters Tab */}
            <button
              type="button"
              onClick={() => setActiveFilter('market')}
              className={`
                flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap
                ${
                  activeFilter === 'market'
                    ? 'bg-[var(--crimson)] text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Route className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Available Clusters ({availableClustersList.length})</span>
            </button>

            {/* My Active Route Tab - VISIBLE ONLY AFTER ADMIN CONFIRMED & ACCEPTED RIDE! */}
            {hasApprovedActiveRide ? (
              <button
                type="button"
                onClick={() => setActiveFilter('my_active')}
                className={`
                  flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap animate-scale-in
                  ${
                    activeFilter === 'my_active'
                      ? 'bg-[var(--crimson)] text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>My Active Route ({myPendingOrders.length})</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-sans text-xs sm:text-sm font-medium text-gray-400 opacity-60 cursor-not-allowed shrink-0">
                <Lock className="w-3.5 h-3.5" />
                <span>My Active Route (Locked)</span>
              </div>
            )}

            {/* Completed Dashboard Tab */}
            <button
              type="button"
              onClick={() => setActiveFilter('completed')}
              className={`
                flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap
                ${
                  activeFilter === 'completed'
                    ? 'bg-[var(--crimson)] text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Completed ({myDeliveredOrders.length})</span>
            </button>
          </div>

          {/* Wallet Balance Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-mono font-bold text-amber-900 shrink-0">
            <Wallet className="w-4 h-4 text-amber-600" />
            <span>Earned: ₹{myEarnedPayout}</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 sm:p-6 flex flex-col gap-4 sm:gap-6">

        {/* TAB 1: AVAILABLE CLUSTERS MARKETPLACE */}
        {activeFilter === 'market' && (
          <div className="flex flex-col gap-4">
            {availableClustersList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
                <CheckCircle className="w-12 h-12 text-emerald-500 stroke-[1.5]" />
                <h3 className="font-display font-bold text-lg text-gray-800">All Delivery Clusters Assigned!</h3>
                <p className="text-xs font-sans text-gray-500 max-w-sm">
                  There are no unassigned clusters available right now. When admin adds new order batches, they will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-gray-900">
                    Available Delivery Clusters ({availableClustersList.length})
                  </h2>
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    ₹50 / Order Guaranteed Pay
                  </span>
                </div>

                {/* Grid of Individual Available Cluster Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {availableClustersList.map((cluster) => {
                    const hasRequested = clusterRequests.some(
                      (r) => r.clusterId === cluster.id && r.riderId === activeGigRider.id && r.status === 'pending'
                    );
                    const applicantCount = clusterRequests.filter(
                      (r) => r.clusterId === cluster.id && r.status === 'pending'
                    ).length;

                    return (
                      <div
                        key={cluster.id}
                        className="bg-white rounded-3xl border-2 border-[var(--gold)]/60 p-5 shadow-md flex flex-col justify-between gap-5 relative overflow-hidden transition-all hover:border-[var(--gold)]"
                      >
                        {/* Payout Banner Header */}
                        <div className="bg-gradient-to-r from-[#8B1A1A] to-[#6B0F14] text-white p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[var(--gold)] font-display font-bold text-base truncate">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span className="truncate">{cluster.name}</span>
                            </div>
                            {applicantCount > 0 && (
                              <span className="font-mono text-[10px] bg-amber-400 text-gray-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <Users className="w-3 h-3" />
                                <span>{applicantCount} Requested</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                            <h3 className="font-display font-bold text-2xl text-white">
                              ₹{cluster.payoutAmount} Payout
                            </h3>
                            <div className="flex flex-col items-end">
                              <span className="font-mono text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-lg border border-white/20 font-bold">
                                {cluster.ordersCount} Orders
                              </span>
                              <span className="text-[10px] font-mono text-[var(--gold)] font-semibold mt-0.5">
                                ₹{cluster.orders.reduce((sum, o) => sum + o.total, 0)} Rev
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order List Snippet */}
                        {cluster.orders.length > 0 && (
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col gap-1 text-xs">
                            <span className="font-bold text-[#8B1A1A]">Zone Orders:</span>
                            {cluster.orders.map((o) => (
                              <div key={o.orderId} className="flex items-center justify-between text-[11px] font-mono">
                                <span className="font-bold text-gray-900">{o.orderId} • {o.customerName}</span>
                                <span className="text-gray-600">₹{o.total}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Route Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                          <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Orders</span>
                            <span className="font-mono text-lg font-bold text-[#8B1A1A] mt-0.5">
                              {cluster.ordersCount} Drops
                            </span>
                            <span className="text-[9px] font-sans text-gray-500">₹50 / drop</span>
                          </div>

                          <div className="flex flex-col items-center text-center border-x border-gray-200 px-1">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Distance</span>
                            <span className="font-mono text-lg font-bold text-amber-700 mt-0.5">
                              {cluster.totalDistanceKm} km
                            </span>
                            <span className="text-[9px] font-sans text-gray-500">Kitchen base</span>
                          </div>

                          <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Est. Time</span>
                            <span className="font-mono text-lg font-bold text-emerald-700 mt-0.5">
                              ~{cluster.totalTimeMin} mins
                            </span>
                            <span className="text-[9px] font-sans text-gray-500">Continuous</span>
                          </div>
                        </div>

                        {/* Assignment & Request Status Button */}
                        {cluster.assignedPartner?.id === activeGigRider.id ? (
                          <div className="w-full py-3 rounded-xl bg-emerald-700 text-white font-sans font-bold text-xs shadow-sm flex items-center justify-center gap-2 border border-emerald-500">
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>Assigned to You (Check My Active Route)</span>
                          </div>
                        ) : cluster.assignedPartner ? (
                          <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-sans font-semibold text-xs flex items-center justify-center gap-2 border border-gray-300">
                            <Truck className="w-4 h-4 text-gray-500" />
                            <span>Assigned to {cluster.assignedPartner.name}</span>
                          </div>
                        ) : hasRequested ? (
                          <div className="w-full py-3.5 rounded-xl bg-amber-400 text-gray-900 font-sans font-bold text-xs shadow-sm flex items-center justify-center gap-2 border border-amber-300">
                            <Hourglass className="w-4 h-4 animate-spin text-gray-900" />
                            <span>Request Pending Admin Approval ⏳</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestCluster(cluster as any)}
                            className="w-full py-3.5 rounded-xl bg-[var(--gold)] hover:bg-amber-400 text-[var(--mahogany)] font-sans font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-center border border-white/30"
                          >
                            <span>Request Cluster Batch (₹{cluster.payoutAmount}) 🚀</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Privacy Shield & Workflow Disclaimer */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <p className="text-xs font-sans text-amber-900 leading-relaxed">
                    <strong>Cluster Request & Privacy Protection:</strong> Request a cluster above to send your application to the Admin. Customer addresses and navigation unlock only after Admin approves your request.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY CONFIRMED APPROVED ACTIVE ROUTE */}
        {activeFilter === 'my_active' && (
          <div className="flex flex-col gap-4 sm:gap-6">

            {/* SMART ROUTE SUMMARY BANNER FOR APPROVED ROUTE */}
            {myPendingOrders.length > 0 && (
              <div className="bg-gradient-to-r from-[var(--mahogany)] to-[#4A151B] text-white p-3.5 sm:p-5 rounded-2xl border border-[var(--gold)]/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--gold)]/20 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)] shrink-0">
                    <Route className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-sm sm:text-base text-[var(--gold)]">
                        Admin Confirmed Active Route
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold uppercase">
                        Optimal Pathing
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/80 font-sans mt-0.5 leading-tight">
                      Sequenced from <strong>Kitchen Store Hub</strong> for fastest delivery.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white/10 p-2 sm:p-2.5 rounded-xl border border-white/15 shrink-0 text-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase text-white/70">Distance</span>
                    <span className="font-mono text-sm sm:text-lg font-bold text-[var(--gold)]">
                      {myRouteSummary.totalDistanceKm} km
                    </span>
                  </div>
                  <div className="flex flex-col border-x border-white/15 px-1">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase text-white/70">Est. Time</span>
                    <span className="font-mono text-sm sm:text-lg font-bold text-white">
                      ~{myRouteSummary.totalTimeMin}m
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase text-white/70">Stops</span>
                    <span className="font-mono text-sm sm:text-lg font-bold text-emerald-400">
                      {myPendingOrders.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVE STOP #1 SPOTLIGHT BANNER */}
            {currentActiveStop && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#8B1A1A] text-white flex items-center justify-center font-mono font-bold text-base sm:text-lg shrink-0 shadow-sm">
                    #1
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider bg-amber-200/60 px-2 py-0.5 rounded border border-amber-300">
                        NEXT IMMEDIATE STOP
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-900">
                        ({currentActiveStop.distanceFromPrevKm} km from Kitchen)
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-gray-900 mt-1 truncate">
                      {currentActiveStop.customerName || 'Customer'} · <span className="font-mono text-xs sm:text-sm text-[#8B1A1A]">{currentActiveStop.orderId}</span>
                    </h3>
                    <p className="text-xs font-sans text-gray-700 mt-0.5 line-clamp-2">
                      📍 {currentActiveStop.address?.fullAddress}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openGoogleMapsPinpoint(currentActiveStop)}
                  className="w-full md:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-[var(--gold)]/30 active:scale-95 text-center"
                >
                  <Navigation className="w-4 h-4 text-[var(--gold)] animate-pulse" />
                  <span>Navigate to Stop #1 (Google Maps)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order ID, customer, address..."
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-gray-200 font-sans text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
                />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-sans text-gray-500 hover:text-gray-900 underline cursor-pointer shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Approved Active Order Cards */}
            {displayedPendingOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 stroke-[1.5]" />
                <h3 className="font-display font-bold text-base text-gray-800">No Approved Active Route</h3>
                <p className="text-xs font-sans text-gray-500 max-w-sm">
                  {searchQuery
                    ? `No orders matching "${searchQuery}"`
                    : 'You do not have any approved active delivery clusters right now.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {displayedPendingOrders.map((order: any) => {
                  const isOutForDelivery = order.status === 'out_for_delivery';
                  const address = order.address;
                  const stopNum = order.stopNumber;

                  return (
                    <div
                      key={order.orderId}
                      className="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-5 flex flex-col justify-between gap-3 sm:gap-4 shadow-2xs transition-all hover:shadow-xs relative overflow-hidden"
                    >
                      <div className="flex flex-col gap-2.5 sm:gap-3">
                        {/* Sequential Stop Badge & Order ID */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 flex-wrap gap-1.5">
                          <div className="flex items-center gap-1.5">
                            {stopNum && (
                              <span className="font-mono text-xs font-bold text-white bg-[#8B1A1A] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-2xs border border-[var(--gold)]/30">
                                STOP #{stopNum}
                              </span>
                            )}
                            <span className="font-mono text-xs font-bold text-[#8B1A1A] bg-[#F5EEE1] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#EACFA5]">
                              {order.orderId}
                            </span>
                          </div>

                          <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Customer Details */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <span className="font-display font-bold text-base text-gray-900 truncate">
                              {order.customerName || 'Customer'}
                            </span>
                            <span className="font-sans text-xs text-gray-500">
                              {order.customerPhone || '+91 98765 43210'}
                            </span>
                          </div>

                          {order.customerPhone && (
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-sans font-bold text-xs border border-emerald-200 transition-all shrink-0"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>

                        {/* Delivery Address Box */}
                        {address && (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-[#8B1A1A] shrink-0 mt-0.5" />
                              <div className="flex flex-col text-xs font-sans text-gray-800 leading-relaxed min-w-0">
                                <span className="font-bold truncate">{address.fullName} ({address.tag || 'Home'})</span>
                                <span className="line-clamp-2">{address.fullAddress}</span>
                                <span className="font-mono text-[11px] text-gray-500 font-semibold">Pincode: {address.pincode}</span>
                              </div>
                            </div>

                            {/* Google Maps Pinpoint Action Button */}
                            <button
                              type="button"
                              onClick={() => openGoogleMapsPinpoint(order)}
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs shadow-2xs transition-all cursor-pointer mt-1 text-center"
                            >
                              <Navigation className="w-3.5 h-3.5 text-[var(--gold)]" />
                              <span>Open Google Maps Location 🗺️</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Items Summary & Payment Info */}
                        <div className="flex flex-col gap-1.5 text-xs font-sans border-t border-gray-100 pt-2.5">
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Items ({order.items.length}):</span>
                            <span className="font-medium truncate max-w-[180px] sm:max-w-[200px]">
                              {order.items.map((i: any) => `${i.item.name} (x${i.quantity})`).join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                            <span>Total Bill Amount:</span>
                            <span className="font-mono text-sm text-[#8B1A1A]">₹{order.total.toLocaleString('en-IN')}</span>
                          </div>
                          <span className="text-[11px] font-mono text-gray-500 truncate">
                            {order.adminNotes || 'Cash on Delivery (Collect Cash)'}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Actions Bar */}
                      <div className="flex flex-col gap-2 pt-2.5 border-t border-gray-100">
                        <div className="flex flex-col gap-2">
                          {!isOutForDelivery && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(order.orderId, 'out_for_delivery')}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-xs shadow-2xs transition-all cursor-pointer text-center"
                            >
                              <Truck className="w-4 h-4" />
                              <span>Mark Out for Delivery 🚚</span>
                            </button>
                          )}

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-500 font-bold">₹</span>
                              <input
                                type="number"
                                value={collectedCashMap[order.orderId] ?? order.total}
                                onChange={(e) =>
                                  setCollectedCashMap({
                                    ...collectedCashMap,
                                    [order.orderId]: Number(e.target.value) || 0,
                                  })
                                }
                                placeholder="Cash"
                                className="w-full pl-6 pr-2 py-2 rounded-xl border border-gray-300 font-mono text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleMarkDelivered(order)}
                              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold text-xs shadow-2xs transition-all cursor-pointer text-center"
                            >
                              <Check className="w-4 h-4" />
                              <span>Mark Delivered ✅ (+₹50 Pay)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPLETED DELIVERIES RIDER PERFORMANCE DASHBOARD & SINGLE-LINE HISTORY */}
        {activeFilter === 'completed' && (
          <div className="flex flex-col gap-6">
            {/* Rider Performance Dashboard KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white p-4 rounded-2xl border border-emerald-700/50 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-mono text-emerald-200 uppercase tracking-wider font-semibold">Total Earned</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-display font-bold text-2xl sm:text-3xl text-emerald-300">₹{myEarnedPayout}</span>
                  <span className="text-[10px] font-sans text-emerald-200 bg-emerald-700/50 px-2 py-0.5 rounded-md">₹50 / drop</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold font-sans">Orders Completed</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-display font-bold text-2xl sm:text-3xl text-gray-900">{myDeliveredOrders.length}</span>
                  <span className="text-xs font-sans font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">100% Success</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold font-sans">Distance Covered</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-display font-bold text-2xl sm:text-3xl text-amber-700">{completedRouteSummary.totalDistanceKm} km</span>
                  <span className="text-[10px] font-sans text-gray-500">From Hub</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold font-sans">Delivery Time</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-display font-bold text-2xl sm:text-3xl text-blue-700">~{completedRouteSummary.totalTimeMin}m</span>
                  <span className="text-[10px] font-sans text-gray-500">Total duration</span>
                </div>
              </div>
            </div>

            {/* Completed Deliveries Single-Line Table List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-display font-bold text-base text-gray-900">
                  Completed Delivery History ({myDeliveredOrders.length})
                </h3>
                <span className="text-xs font-sans text-gray-500 font-medium">
                  Guaranteed ₹50 payout per order
                </span>
              </div>

              {myDeliveredOrders.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-10 h-10 text-gray-300 stroke-[1.5]" />
                  <span className="font-sans font-bold text-sm text-gray-700">No Completed Deliveries Yet</span>
                  <span className="text-xs font-sans text-gray-500">Delivered orders will appear here in a single-line summary with your earnings.</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {myDeliveredOrders.map((order: any) => (
                    <div
                      key={order.orderId}
                      className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Left: Order ID & Customer Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-[#8B1A1A] bg-[#F5EEE1] px-2.5 py-1 rounded-lg border border-[#EACFA5] shrink-0">
                          {order.orderId}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-gray-900 truncate">
                              {order.customerName || 'Customer'}
                            </span>
                            <span className="text-xs font-sans text-gray-500 truncate hidden md:inline">
                              · {order.address?.fullAddress || 'Madurai'}
                            </span>
                          </div>
                          <span className="text-[11px] font-sans text-gray-500 truncate">
                            📞 {order.customerPhone || '+91 98765 43210'} · Total Bill: ₹{order.total}
                          </span>
                        </div>
                      </div>

                      {/* Right: Payout Badge */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered (+₹50 Earned)</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
