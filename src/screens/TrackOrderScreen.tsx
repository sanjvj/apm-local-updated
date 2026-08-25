import type { FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Header, Container, Toast } from '../components';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { Search, Truck, Phone, CheckCircle2, Clock, MapPin, ChefHat, PackageCheck, AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export interface TrackOrderScreenProps {
  onBackToMenu: () => void;
  onBackToCart: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToOrders?: () => void;
}

export const TrackOrderScreen: FC<TrackOrderScreenProps> = ({
  onBackToMenu,
  onBackToCart,
  onNavigateToAdmin,
  onNavigateToOrders,
}) => {
  const { allOrders, getOrderById } = useOrders();
  const { lastOrder } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // Retrieve orderId from URL query param
  const queryOrderId = searchParams.get('orderId');

  // Determine active order ID to display
  const effectiveOrderId =
    queryOrderId || lastOrder?.orderId || (allOrders.length > 0 ? allOrders[0].orderId : '');

  // Search input controlled state
  const [searchIdInput, setSearchIdInput] = useState<string>(effectiveOrderId);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sync search input state whenever query parameter changes
  useEffect(() => {
    if (queryOrderId) {
      setSearchIdInput(queryOrderId);
    } else if (lastOrder?.orderId) {
      setSearchIdInput(lastOrder.orderId);
    } else if (allOrders.length > 0) {
      setSearchIdInput(allOrders[0].orderId);
    }
  }, [queryOrderId, lastOrder?.orderId, allOrders]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Find exact or partial matching order
  const order =
    (queryOrderId ? getOrderById(queryOrderId) : undefined) ||
    allOrders.find(
      (o) => o.orderId.toLowerCase() === searchIdInput.trim().toLowerCase()
    ) ||
    allOrders.find(
      (o) => o.orderId.toLowerCase().includes(searchIdInput.trim().toLowerCase())
    ) ||
    (lastOrder ? getOrderById(lastOrder.orderId) : undefined) ||
    allOrders[0];

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const term = searchIdInput.trim();
    if (!term) return;

    // Search exact or partial match
    const matched =
      getOrderById(term) ||
      allOrders.find((o) => o.orderId.toLowerCase().includes(term.toLowerCase()));

    if (matched) {
      setSearchParams({ orderId: matched.orderId });
      setSearchIdInput(matched.orderId);
    } else {
      setSearchError(`No order found matching "${term}". Showing recent order below.`);
      if (allOrders.length > 0) {
        setSearchParams({ orderId: allOrders[0].orderId });
      }
    }
  };

  const getStepIcon = (status: string, completed: boolean) => {
    if (completed) return <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />;
    switch (status) {
      case 'placed':
        return <Clock className="w-5 h-5 text-[var(--gold-dark)]" />;
      case 'confirmed':
      case 'preparing':
        return <ChefHat className="w-5 h-5 text-[var(--gold-dark)] animate-pulse" />;
      case 'packed':
        return <PackageCheck className="w-5 h-5 text-[var(--gold-dark)] animate-pulse" />;
      case 'picked_up':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-[var(--crimson)] animate-bounce" />;
      case 'delivered':
        return <PackageCheck className="w-5 h-5 text-[var(--success)]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Layout className="pb-0">
      <div className="flex flex-col min-h-screen bg-[var(--ivory)]">
        {/* Header Bar */}
        <Header
          onNavigateToMenu={onBackToMenu}
          onNavigateToCart={onBackToCart}
          onNavigateToAdmin={onNavigateToAdmin}
          onNavigateToOrders={onNavigateToOrders}
        />

        <div className="flex-1 py-8 flex flex-col gap-6">
          <Container className="flex flex-col gap-6 max-w-4xl">

            {/* Back Button & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[var(--crimson)] hover:underline cursor-pointer w-fit mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Storefront</span>
                </button>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--mahogany)]">
                  Live Order Tracker
                </h1>
                <p className="font-sans text-xs sm:text-sm text-[var(--mahogany-soft)] opacity-80">
                  Real-time kitchen updates & delivery rider tracking in Madurai
                </p>
              </div>

              {/* Order Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[var(--mahogany-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchIdInput}
                    onChange={(e) => {
                      setSearchIdInput(e.target.value);
                      if (searchError) setSearchError(null);
                    }}
                    placeholder="Enter Order ID (e.g. APM-LD-94812)"
                    className="
                      pl-9 pr-3 py-2 rounded-xl border border-[var(--line)] bg-white font-mono text-xs sm:text-sm
                      text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] w-56 sm:w-64 shadow-2xs
                    "
                  />
                </div>
                <button
                  type="submit"
                  className="
                    px-4 py-2 rounded-xl bg-[var(--crimson)] text-white text-xs font-sans font-bold
                    hover:bg-[var(--crimson-dark)] transition-all cursor-pointer shadow-sm active:scale-95
                  "
                >
                  Track
                </button>
              </form>
            </div>

            {/* Error Notification Banner if search failed */}
            {searchError && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between text-xs font-sans text-amber-900 shadow-2xs animate-scale-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{searchError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchError(null)}
                  className="text-amber-800 font-bold underline hover:text-amber-950 cursor-pointer text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Order Card Container */}
            {order ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column (7 cols): Real-Time Status Timeline */}
                <div className="lg:col-span-7 bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 sm:p-6 shadow-sm flex flex-col gap-6">

                  {/* Header Row: Order ID & Status Badge */}
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-[var(--mahogany-soft)]">Tracking Order</span>
                      <span className="font-mono font-bold text-xl text-[var(--crimson)]">
                        {order.orderId}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--gold-dark)] font-bold">
                        Current Status
                      </span>
                      <span className="
                        mt-0.5 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider
                        bg-[var(--gold)]/20 text-[var(--mahogany)] border border-[var(--gold)]/40 animate-pulse
                      ">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Steps Stream */}
                  <div className="flex flex-col gap-6 relative pl-2">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-[var(--line)] -z-0" />

                    {order.timeline.map((step, idx) => (
                      <div key={step.status} className="flex items-start gap-4 relative z-10">
                        {/* Step Icon Badge */}
                        <div className={`
                          w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 shadow-2xs transition-all
                          ${
                            step.completed
                              ? 'bg-emerald-50 border-emerald-500'
                              : idx === order.timeline.findIndex((t) => !t.completed)
                              ? 'bg-[var(--ivory-warm)] border-[var(--gold-dark)] ring-4 ring-[var(--gold)]/20'
                              : 'bg-gray-50 border-gray-200 opacity-50'
                          }
                        `}>
                          {getStepIcon(step.status, step.completed)}
                        </div>

                        {/* Step Details */}
                        <div className="flex flex-col min-w-0 flex-1 pt-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-sans font-bold text-sm sm:text-base ${step.completed ? 'text-[var(--mahogany)]' : 'text-[var(--mahogany-soft)]'}`}>
                              {step.label}
                            </span>
                            {step.timestamp && (
                              <span className="font-mono text-xs text-[var(--mahogany-soft)] opacity-75">
                                {step.timestamp}
                              </span>
                            )}
                          </div>
                          {step.note && (
                            <p className="font-sans text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 mt-1.5 font-medium">
                              💡 {step.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Right Column (5 cols): Rider Info & Order Recap */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                  {/* Assigned Rider Info Card */}
                  <div className="bg-[var(--mahogany)] text-[var(--ivory)] rounded-[var(--radius)] p-5 shadow-md flex flex-col gap-4 border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[var(--gold)]" />
                        <h3 className="font-display font-bold text-lg text-[var(--gold)]">
                          Delivery Partner
                        </h3>
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[var(--gold)] text-[var(--mahogany)] px-2 py-0.5 rounded-full">
                        MADURAI LOCAL
                      </span>
                    </div>

                    {order.assignedPartner ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--ivory-warm)] text-[var(--mahogany)] font-serif font-bold text-xl flex items-center justify-center shrink-0 border-2 border-[var(--gold)]">
                              {order.assignedPartner.avatar}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans font-bold text-base text-white">
                                {order.assignedPartner.name}
                              </span>
                              <span className="font-mono text-xs text-[var(--gold)]">
                                {order.assignedPartner.vehicleType}
                              </span>
                              <span className="font-mono text-[11px] text-white/70">
                                Reg: {order.assignedPartner.vehicleNo}
                              </span>
                            </div>
                          </div>

                          <a
                            href={`tel:${order.assignedPartner.phone}`}
                            className="
                              p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500
                              transition-colors shadow-sm flex items-center justify-center shrink-0 cursor-pointer
                            "
                            title="Call Delivery Partner"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                        </div>

                        {order.assignedPartner.currentArea && (
                          <div className="bg-white/10 rounded-xl p-2.5 text-xs font-sans text-white/90 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[var(--gold)] shrink-0" />
                            <span>Current Location: <strong className="text-[var(--gold)]">{order.assignedPartner.currentArea}</strong></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 text-center flex flex-col items-center gap-2 text-white/70">
                        <Clock className="w-6 h-6 text-[var(--gold)] animate-spin" />
                        <span className="font-sans text-xs font-medium">
                          Assigning local delivery partner from kitchen...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delivery Address & Slot Details Recap Card */}
                  <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-2xs flex flex-col gap-4">
                    <h3 className="font-display font-bold text-lg text-[var(--mahogany)] border-b border-[var(--line)] pb-3">
                      Delivery Address & Slot
                    </h3>

                    {order.slot && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-[var(--gold-dark)] shrink-0 mt-0.5" />
                        <div className="flex flex-col text-xs">
                          <span className="font-sans font-bold text-[var(--mahogany)]">
                            Slot: {order.slot.timeWindow}
                          </span>
                        </div>
                      </div>
                    )}

                    {order.address && (
                      <div className="flex items-start gap-3 border-t border-[var(--line)]/60 pt-3">
                        <MapPin className="w-4 h-4 text-[var(--crimson)] shrink-0 mt-0.5" />
                        <div className="flex flex-col text-xs min-w-0">
                          <span className="font-sans font-bold text-[var(--mahogany)]">
                            {order.customerName || order.address.fullName || order.address.tag}
                          </span>
                          <span className="text-[var(--mahogany-soft)] opacity-90 truncate">
                            {order.address.fullAddress}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--mahogany-soft)] opacity-75 mt-0.5">
                            Phone: {order.address.contactNumber}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-xs font-mono">
                      <span className="text-[var(--mahogany-soft)]">Total Paid:</span>
                      <span className="font-bold text-lg text-[var(--red-dark)]">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-2xs flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2.5">
                      <ShoppingBag className="w-4 h-4 text-[var(--crimson)]" />
                      <h4 className="font-display font-bold text-base text-[var(--mahogany)]">
                        Items Ordered ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                      </h4>
                    </div>

                    <div className="flex flex-col divide-y divide-[var(--line)]/60 text-xs">
                      {order.items.map(({ item, quantity }) => (
                        <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                          <span className="font-sans text-[var(--mahogany)]">
                            {item.name} × {quantity}
                          </span>
                          <span className="font-mono font-bold text-[var(--mahogany)]">
                            ₹{item.price * quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[var(--line)] p-8 text-center flex flex-col items-center gap-4">
                <AlertCircle className="w-12 h-12 text-[var(--crimson)]" />
                <h3 className="font-display font-bold text-2xl text-[var(--mahogany)]">
                  Order Not Found
                </h3>
                <p className="font-sans text-sm text-[var(--mahogany-soft)] max-w-md">
                  We couldn't find an order matching <code className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[var(--crimson)]">{searchIdInput}</code>. Please double-check your order ID.
                </p>
              </div>
            )}

          </Container>
        </div>

        <Toast />
      </div>
    </Layout>
  );
};
