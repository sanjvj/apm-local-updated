import { useState, type FC } from 'react';
import {
  ShoppingBag,
  Search,
  X,
  ChevronRight,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Calendar,
  Star,
  AlertTriangle,
  Upload,
  Phone,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Container } from '../components/Container';
import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import type { OrderSnapshot } from '../types/order';
import type { OrderStatus } from '../types/delivery';

export interface YourOrdersScreenProps {
  onBackToMenu: () => void;
  onNavigateToTrack: (orderId?: string) => void;
  onNavigateToAdmin?: () => void;
  onNavigateToCart?: () => void;
}

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  placed: {
    label: 'Order Placed',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  preparing: {
    label: 'Kitchen Preparing',
    bg: 'bg-orange-500/10',
    text: 'text-orange-700',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500',
  },
  packed: {
    label: 'Packed at Hub',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-700',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
  picked_up: {
    label: 'Picked Up by Rider',
    bg: 'bg-purple-500/10',
    text: 'text-purple-700',
    border: 'border-purple-500/30',
    dot: 'bg-purple-500',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    bg: 'bg-blue-500/10',
    text: 'text-blue-700',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-600/10',
    text: 'text-emerald-800',
    border: 'border-emerald-600/30',
    dot: 'bg-emerald-600',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10',
    text: 'text-rose-700',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
};

export const YourOrdersScreen: FC<YourOrdersScreenProps> = ({
  onBackToMenu,
  onNavigateToTrack,
  onNavigateToAdmin,
  onNavigateToCart,
}) => {
  const { allOrders, addOrderComplaint, addOrderFeedback } = useOrders();
  const { addToCart } = useCart();

  // User Phone Authentication State (No Signup/Password needed!)
  const [userPhone, setUserPhone] = useState<string>(() => {
    try {
      return localStorage.getItem('apm_user_phone') || '';
    } catch {
      return '';
    }
  });
  const [inputPhone, setInputPhone] = useState<string>(userPhone || '');
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(!userPhone);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderSnapshot | null>(null);
  const [reorderedToast, setReorderedToast] = useState<string | null>(null);

  // Feedback Modal State
  const [feedbackOrder, setFeedbackOrder] = useState<OrderSnapshot | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  // Complaint Modal State (Mandatory Photo Upload)
  const [complaintOrder, setComplaintOrder] = useState<OrderSnapshot | null>(null);
  const [complaintCategory, setComplaintCategory] = useState<string>('Damaged Packaging');
  const [complaintDescription, setComplaintDescription] = useState<string>('');
  const [complaintImage, setComplaintImage] = useState<string | null>(null);
  const [complaintError, setComplaintError] = useState<string | null>(null);

  const handleVerifyPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = inputPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const finalPhone = cleanDigits.slice(-10);
    setUserPhone(finalPhone);
    try {
      localStorage.setItem('apm_user_phone', finalPhone);
    } catch {}
    setShowPhoneModal(false);
    setPhoneError(null);
  };

  // Filter orders strictly matching ONLY the logged in user's mobile number
  const myOrders = allOrders.filter((order) => {
    if (!userPhone) return false;
    const cleanUserPin = userPhone.replace(/\D/g, '').slice(-10);
    const orderPhone = (order.customerPhone || order.address?.contactNumber || '').replace(/\D/g, '');
    return cleanUserPin.length >= 10 && orderPhone.endsWith(cleanUserPin);
  });

  // Filter orders by tab and search query
  const filteredOrders = myOrders.filter((order) => {
    const status = order.status || 'confirmed';

    let matchesTab = true;
    if (activeTab === 'active') {
      matchesTab = ['placed', 'confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery'].includes(status);
    } else if (activeTab === 'delivered') {
      matchesTab = status === 'delivered';
    } else if (activeTab === 'cancelled') {
      matchesTab = status === 'cancelled';
    }

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.orderId.toLowerCase().includes(q) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.address?.fullAddress && order.address.fullAddress.toLowerCase().includes(q)) ||
      order.items.some((i) => i.item.name.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  const handleReorder = (order: OrderSnapshot) => {
    order.items.forEach((itemSnap) => {
      for (let i = 0; i < itemSnap.quantity; i++) {
        addToCart(itemSnap.item.id);
      }
    });
    setReorderedToast(`Readded ${order.items.length} items from ${order.orderId} to your cart!`);
    setTimeout(() => setReorderedToast(null), 3000);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Layout className="min-h-screen bg-[var(--ivory)]">
      <TopBar
        title="Your Orders"
        showBack
        onBack={onBackToMenu}
        rightElement={
          <div className="flex items-center gap-2">
            {userPhone ? (
              <button
                type="button"
                onClick={() => {
                  setInputPhone(userPhone);
                  setShowPhoneModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-mono font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Click to change mobile number"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>+91 {userPhone}</span>
                <span className="text-[10px] text-emerald-700 underline font-sans ml-1">Change</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowPhoneModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5A93B] text-[#2C1810] text-xs font-sans font-bold hover:bg-[#C8860A] transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Enter Mobile Number</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--mahogany)] text-[var(--gold)] text-xs font-sans font-bold hover:bg-[var(--mahogany-soft)] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore Menu</span>
            </button>
          </div>
        }
      />

      {/* Toast Banner for Reorder Action */}
      {reorderedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#2C1810] text-[#FAF7F2] px-5 py-3 rounded-2xl shadow-2xl border border-[#D4AF37]/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-sans font-semibold">{reorderedToast}</span>
          {onNavigateToCart && (
            <button
              type="button"
              onClick={onNavigateToCart}
              className="ml-2 px-3 py-1 rounded-lg bg-[#E5A93B] text-[#2C1810] text-xs font-bold hover:bg-[#C8860A] transition-colors cursor-pointer"
            >
              View Cart
            </button>
          )}
        </div>
      )}

      {/* Main Body */}
      <Container className="py-6 sm:py-8 flex flex-col gap-6">
        {/* Banner Eyebrow */}
        <div className="bg-gradient-to-r from-[#3A0A0E] via-[#5C1015] to-[#3A0A0E] text-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <ShoppingBag className="w-64 h-64 text-[#D4AF37]" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#E5A93B] font-bold block mb-1">
                Annapoorna Mithai • Order Receipts
              </span>
              <h1 className="font-display font-semibold text-2xl sm:text-3xl text-white tracking-tight">
                {userPhone ? `Orders for +91 ${userPhone}` : 'Your Customer Order History'}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-white/75 mt-1 max-w-xl">
                {userPhone
                  ? `Showing orders placed with mobile number +91 ${userPhone}. Track live deliveries, submit feedback, or reorder instantly.`
                  : 'Enter your 10-digit mobile number to view your personal order history.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 flex flex-col items-center">
                <span className="font-display font-bold text-xl text-[#E5A93B] leading-none">
                  {myOrders.length}
                </span>
                <span className="font-sans text-[10px] text-white/70 uppercase tracking-wider font-medium mt-1">
                  Your Orders
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EACFA5] shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Orders', count: myOrders.length },
              {
                id: 'active',
                label: 'In Progress',
                count: myOrders.filter((o) =>
                  ['placed', 'confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery'].includes(o.status || 'confirmed')
                ).length,
              },
              {
                id: 'delivered',
                label: 'Delivered',
                count: myOrders.filter((o) => (o.status || 'confirmed') === 'delivered').length,
              },
              {
                id: 'cancelled',
                label: 'Cancelled',
                count: myOrders.filter((o) => (o.status || 'confirmed') === 'cancelled').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#8B1A1A] text-white shadow-xs'
                    : 'text-[#2C1810]/70 hover:bg-[#F5EEE1] hover:text-[#2C1810]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#8B1A1A] border border-[#EACFA5]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, item..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FAF7F2] border border-[#EACFA5] text-xs font-sans text-[#2C1810] placeholder:text-black/40 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status || 'confirmed'] || STATUS_CONFIG.confirmed;

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl border border-[#EACFA5] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#8B1A1A]">
                          {order.orderId}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold flex items-center gap-1.5 border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </div>
                      <span className="font-sans text-[11px] text-black/50 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-black/40" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-bold text-lg text-[#2C1810] block">
                        ₹ {order.total}
                      </span>
                      <span className="font-sans text-[10px] text-black/50">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                      </span>
                    </div>
                  </div>

                  {/* Items Summary Snippet */}
                  <div className="flex flex-col gap-2 bg-[#F5EEE1]/50 p-3 rounded-xl border border-[#EACFA5]/50">
                    <div className="flex items-center justify-between text-xs font-sans text-black/70">
                      <span className="font-semibold text-[#2C1810]">Order Items</span>
                      <span className="text-[11px] text-black/50">{order.slot?.timeWindow || 'Same-day Slot'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {order.items.slice(0, 3).map((itemSnap, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-sans">
                          <span className="text-[#2C1810] truncate max-w-[240px] sm:max-w-[300px]">
                            • {itemSnap.item.name}
                          </span>
                          <span className="font-mono text-black/60 shrink-0">
                            x{itemSnap.quantity} (₹{itemSnap.item.price * itemSnap.quantity})
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-[11px] font-sans italic text-[#8B1A1A] font-medium mt-0.5">
                          + {order.items.length - 3} more items...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address & Delivery Partner info if present */}
                  <div className="flex flex-col gap-1.5 text-xs font-sans text-black/70">
                    {order.address && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#8B1A1A] shrink-0" />
                        <span className="truncate">{order.address.fullAddress}</span>
                      </div>
                    )}
                    {order.assignedPartner && (
                      <div className="flex items-center gap-2 text-emerald-800 font-medium">
                        <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Rider: {order.assignedPartner.name} ({order.assignedPartner.vehicleNo})</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-xl border border-[#EACFA5] bg-white hover:bg-[#F5EEE1] text-xs font-sans font-semibold text-[#2C1810] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8B1A1A]" />
                    </button>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {order.status === 'delivered' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setFeedbackOrder(order);
                              setFeedbackRating(order.feedback?.rating || 5);
                              setFeedbackComment(order.feedback?.comment || '');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-xs font-sans font-bold text-amber-900 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{order.feedback ? `${order.feedback.rating}★ Review` : 'Feedback'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setComplaintOrder(order);
                              setComplaintCategory(order.complaint?.category || 'Damaged Packaging');
                              setComplaintDescription(order.complaint?.description || '');
                              setComplaintImage(order.complaint?.imageUrl || null);
                              setComplaintError(null);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-sans font-bold transition-colors cursor-pointer flex items-center gap-1 border ${
                              order.complaint
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{order.complaint ? 'Complaint Filed' : 'Raise Complaint'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white text-xs font-sans font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reorder</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onNavigateToTrack(order.orderId)}
                            className="px-3 py-1.5 rounded-xl bg-[var(--ivory-warm)] border border-[var(--line)] hover:bg-[#FAF7F2] text-xs font-sans font-semibold text-[#2C1810] transition-colors cursor-pointer flex items-center gap-1"
                            title="Track live status"
                          >
                            <Truck className="w-3.5 h-3.5 text-[var(--gold-dark)]" />
                            <span className="hidden xs:inline">Track Live</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white text-xs font-sans font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reorder</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-[#EACFA5] flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#E5A93B]/20 flex items-center justify-center text-[#C8860A]">
              <PackageCheck className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#2C1810]">No orders found</h3>
            <p className="font-sans text-xs text-black/60 max-w-md leading-relaxed">
              {searchQuery
                ? `No orders matched your search "${searchQuery}".`
                : 'You have no orders in this category yet. Explore our handcrafted Madurai delicacies and place your first order!'}
            </p>
            <button
              type="button"
              onClick={onBackToMenu}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Menu & Order Now</span>
            </button>
          </div>
        )}
      </Container>

      {/* ═══ DETAILED ORDER MODAL ═══ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col gap-5 border border-[#D4AF37]/30">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EACFA5] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#E5A93B] font-bold block">
                  Order Invoice & Receipt
                </span>
                <h3 className="font-display font-bold text-xl text-[#8B1A1A] flex items-center gap-2">
                  <span>{selectedOrder.orderId}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-black/10 transition-colors cursor-pointer text-black/60 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Timeline Summary */}
            <div className="bg-white p-4 rounded-2xl border border-[#EACFA5] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="font-semibold text-[#2C1810]">Current Status:</span>
                <span className="font-bold text-[#8B1A1A] capitalize">
                  {selectedOrder.status ? selectedOrder.status.replace('_', ' ') : 'Confirmed'}
                </span>
              </div>
              {selectedOrder.estimatedDeliveryTime && (
                <div className="flex items-center gap-2 text-xs font-sans text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Estimated Delivery: <strong>{selectedOrder.estimatedDeliveryTime}</strong></span>
                </div>
              )}
            </div>

            {/* Items List Breakdown */}
            <div className="flex flex-col gap-3">
              <h4 className="font-display font-semibold text-sm text-[#8B1A1A] uppercase tracking-wider">
                Itemized Summary ({selectedOrder.items.length} Delicacies)
              </h4>
              <div className="bg-white rounded-2xl border border-[#EACFA5] divide-y divide-[#EACFA5]/50 overflow-hidden">
                {selectedOrder.items.map((itemSnap, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs font-sans">
                    <div className="flex items-center gap-3">
                      {itemSnap.item.imageUrl ? (
                        <img
                          src={itemSnap.item.imageUrl}
                          alt={itemSnap.item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#EACFA5]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#F5EEE1] flex items-center justify-center font-display font-bold text-[#8B1A1A]">
                          AM
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-[#2C1810] block">{itemSnap.item.name}</span>
                        <span className="text-[10px] text-black/50">₹{itemSnap.item.price} per unit</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#8B1A1A] block">
                        ₹{itemSnap.item.price * itemSnap.quantity}
                      </span>
                      <span className="text-[11px] text-black/60 font-mono">
                        Qty: {itemSnap.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Slot Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              <div className="bg-white p-3.5 rounded-2xl border border-[#EACFA5] flex flex-col gap-1.5">
                <span className="font-semibold text-[#8B1A1A] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Delivery Address</span>
                </span>
                <span className="font-bold text-[#2C1810]">{selectedOrder.customerName || selectedOrder.address?.fullName}</span>
                <span className="text-black/70 leading-relaxed">{selectedOrder.address?.fullAddress}</span>
                <span className="text-black/50 font-mono text-[11px]">{selectedOrder.customerPhone || selectedOrder.address?.contactNumber}</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#EACFA5] flex flex-col gap-1.5">
                <span className="font-semibold text-[#8B1A1A] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Selected Time Slot</span>
                </span>
                <span className="font-bold text-[#2C1810]">{selectedOrder.slot?.timeWindow || 'Same-day Express'}</span>
                <span className="text-black/70">{selectedOrder.slot?.cutoffLabel || 'Guaranteed Same-day'}</span>
                <span className="text-emerald-700 font-semibold text-[11px] mt-1">Madurai Local Fleet</span>
              </div>
            </div>

            {/* Billing Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-[#EACFA5] flex flex-col gap-2 text-xs font-sans">
              <div className="flex justify-between text-black/70">
                <span>Subtotal</span>
                <span>₹ {selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Delivery Fee (Madurai Hyperlocal)</span>
                <span className="text-emerald-700 font-semibold">
                  {selectedOrder.deliveryFee === 0 ? 'FREE' : `₹ ${selectedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-[#8B1A1A] font-bold text-sm pt-2 border-t border-[#EACFA5]">
                <span>Total Paid</span>
                <span>₹ {selectedOrder.total}</span>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {selectedOrder.status !== 'delivered' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    onNavigateToTrack(selectedOrder.orderId);
                  }}
                  className="flex-1 py-3 rounded-xl bg-white border border-[#EACFA5] hover:bg-[#F5EEE1] text-[#2C1810] font-sans font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-[#8B1A1A]" />
                  <span>Track Order Live</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleReorder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="flex-1 py-3 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reorder Items</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL 1: FEEDBACK & RATING ═══ */}
      {feedbackOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-[#D4AF37]/30 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#EACFA5] pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-display font-bold text-lg text-[#8B1A1A]">
                  Delicacy Review & Rating
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackOrder(null)}
                className="p-1 rounded-full hover:bg-black/10 transition-colors text-black/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-xs font-sans text-black/70">
              <span>Order ID: <strong className="font-mono text-[#8B1A1A]">{feedbackOrder.orderId}</strong></span>
              <span>Rate your experience with Annapoorna Mithai's fresh delicacies and delivery.</span>
            </div>

            {/* Interactive Star Rating Selector */}
            <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-2xl border border-[#EACFA5]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 hover:scale-125 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= feedbackRating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comment Textarea */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="feedback-comment" className="text-xs font-mono font-bold text-[#2C1810]">
                Write your feedback or review
              </label>
              <textarea
                id="feedback-comment"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={3}
                placeholder="Tell us how much you loved the taste, texture, and packaging..."
                className="w-full p-3 rounded-xl bg-white border border-[#EACFA5] text-xs font-sans focus:outline-none focus:border-[#8B1A1A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EACFA5]">
              <button
                type="button"
                onClick={() => setFeedbackOrder(null)}
                className="px-4 py-2 rounded-xl border border-black/20 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  addOrderFeedback(feedbackOrder.orderId, {
                    rating: feedbackRating,
                    comment: feedbackComment,
                  });
                  setFeedbackOrder(null);
                  setReorderedToast('Thank you! Your feedback has been submitted successfully.');
                  setTimeout(() => setReorderedToast(null), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL 2: RAISE A COMPLAINT (STRICT IMAGE UPLOAD) ═══ */}
      {complaintOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-rose-300 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#EACFA5] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-display font-bold text-lg text-rose-900">
                  Raise an Order Complaint
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setComplaintOrder(null)}
                className="p-1 rounded-full hover:bg-black/10 transition-colors text-black/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-xs font-sans text-black/70">
              <span>Order ID: <strong className="font-mono text-[#8B1A1A]">{complaintOrder.orderId}</strong></span>
              <span>Our support team inspects all complaints. Photo proof of your issue is strictly required.</span>
            </div>

            {/* Error Banner */}
            {complaintError && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 font-sans text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{complaintError}</span>
              </div>
            )}

            {/* Complaint Category Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="complaint-category" className="text-xs font-mono font-bold text-[#2C1810]">
                Complaint Category <span className="text-rose-600">*</span>
              </label>
              <select
                id="complaint-category"
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#EACFA5] text-xs font-sans font-bold focus:outline-none focus:border-[#8B1A1A]"
              >
                <option value="Damaged Packaging">Damaged Packaging / Spilled Container</option>
                <option value="Quality / Freshness Issue">Quality or Freshness Concern</option>
                <option value="Missing Items">Missing Product Items</option>
                <option value="Late Delivery">Severe Delivery Delay</option>
                <option value="Wrong Item Received">Wrong Item Received</option>
              </select>
            </div>

            {/* Complaint Description Textarea */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="complaint-desc" className="text-xs font-mono font-bold text-[#2C1810]">
                Description of Issue <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="complaint-desc"
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                rows={3}
                placeholder="Describe what went wrong with your order in detail..."
                className="w-full p-3 rounded-xl bg-white border border-[#EACFA5] text-xs font-sans focus:outline-none focus:border-[#8B1A1A]"
                required
              />
            </div>

            {/* Mandatory Image Upload Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="complaint-image-input" className="text-xs font-mono font-bold text-[#2C1810] flex items-center justify-between">
                <span>Upload Photo Proof of Query <span className="text-rose-600">* (MANDATORY)</span></span>
              </label>

              {complaintImage ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-rose-300 bg-black/5 group">
                  <img src={complaintImage} alt="Uploaded Complaint Proof" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setComplaintImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-rose-50">
                  <Upload className="w-6 h-6 text-rose-600" />
                  <span className="text-xs font-sans font-bold text-rose-900">Click to upload photo of damaged/wrong item</span>
                  <span className="text-[10px] font-mono text-gray-500">JPG, PNG, WebP photo upload required to submit</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        setComplaintError('Please select a valid image file.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setComplaintImage(evt.target.result as string);
                          setComplaintError(null);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EACFA5]">
              <button
                type="button"
                onClick={() => setComplaintOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-black/20 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!complaintImage || !complaintDescription.trim()}
                onClick={() => {
                  if (!complaintImage) {
                    setComplaintError('Photo proof of your issue is strictly required!');
                    return;
                  }
                  if (!complaintDescription.trim()) {
                    setComplaintError('Please provide a short description of your issue.');
                    return;
                  }

                  addOrderComplaint(complaintOrder.orderId, {
                    category: complaintCategory,
                    description: complaintDescription,
                    imageUrl: complaintImage,
                  });

                  setComplaintOrder(null);
                  setReorderedToast('Complaint submitted successfully! Our Admin team has been notified.');
                  setTimeout(() => setReorderedToast(null), 3500);
                }}
                className={`px-5 py-2.5 rounded-xl font-sans font-bold text-xs shadow-md transition-all ${
                  complaintImage && complaintDescription.trim()
                    ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Complaint ⚠️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL 0: ENTER MOBILE NUMBER TO ACCESS YOUR ORDERS ═══ */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-[#D4AF37]/40 flex flex-col gap-5">
            {userPhone && (
              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors text-black/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-col items-center text-center gap-2 border-b border-[#EACFA5] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8B1A1A] text-[#E5A93B] flex items-center justify-center font-bold shadow-md border border-[#D4AF37]">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#8B1A1A]">
                View Your Orders
              </h3>
              <p className="font-sans text-xs text-black/70 leading-relaxed max-w-xs">
                No password or account login needed! Enter your 10-digit mobile number to view your personal order history.
              </p>
            </div>

            {phoneError && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold font-sans">
                {phoneError}
              </div>
            )}

            <form onSubmit={handleVerifyPhone} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="user-mobile-input" className="text-xs font-mono font-bold text-[#2C1810]">
                  Enter 10-Digit Mobile Number <span className="text-[#8B1A1A]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-mono font-bold text-xs text-black/60">
                    +91
                  </span>
                  <input
                    id="user-mobile-input"
                    type="tel"
                    maxLength={10}
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[#EACFA5] font-mono text-sm text-[#2C1810] font-bold focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#E5A93B]" />
                <span>View My Orders 🚀</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer
        onNavigateToMenu={onBackToMenu}
        onNavigateToTrack={() => onNavigateToTrack()}
        onNavigateToAdmin={onNavigateToAdmin}
      />
    </Layout>
  );
};
