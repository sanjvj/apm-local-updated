import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Layout, Header, PageHeading, Container, SummaryCard, Toast } from '../components';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useSlots } from '../context/SlotContext';
import type { OrderSnapshot } from '../types/order';
import { Clock, MapPin, ShieldCheck, Lock, ArrowRight, CreditCard } from 'lucide-react';

export interface PaymentScreenProps {
  onBackToAddress: () => void;
  onBackToSlot: () => void;
  onBackToCart: () => void;
  onBackToMenu: () => void;
  onPaymentSuccess: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToTrack?: (orderId?: string) => void;
}

export const PaymentScreen: FC<PaymentScreenProps> = ({
  onBackToAddress,
  onBackToSlot,
  onBackToCart,
  onBackToMenu,
  onPaymentSuccess,
  onNavigateToAdmin,
  onNavigateToTrack,
}) => {
  const {
    cartItemsList,
    subtotal,
    selectedSlotId,
    selectedAddress,
    setLastOrder,
    clearCart,
  } = useCart();

  const { addOrderToSystem } = useOrders();
  const { slots, bookSlot } = useSlots();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const deliveryThreshold = 300;

  // Guard: Only redirect to menu if cart is empty AND no payment is processing
  useEffect(() => {
    if (cartItemsList.length === 0 && !isProcessing) {
      // Don't auto-redirect if we are navigating away after payment
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [cartItemsList.length, isProcessing]);

  if (cartItemsList.length === 0 && !isProcessing) {
    onBackToMenu();
    return null;
  }

  const isFreeDelivery = subtotal >= deliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;

  const handlePayment = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const mockOrderId = `APM-LD-${randomNum}`;
    const paymentLabel = paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI / GPay' : 'Card';

    const orderSnapshot: OrderSnapshot = {
      orderId: mockOrderId,
      items: [...cartItemsList],
      subtotal,
      deliveryFee,
      total: totalAmount,
      slot: selectedSlot || null,
      address: selectedAddress || null,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      customerName: selectedAddress?.fullName || 'Customer',
      customerPhone: selectedAddress?.contactNumber || '+91 98765 43210',
      adminNotes: `Paid via ${paymentLabel}`,
      timeline: [
        { status: 'placed', label: 'Order Placed', timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), completed: true },
        { status: 'confirmed', label: `Order Confirmed (${paymentLabel})`, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), completed: true },
        { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
        { status: 'packed', label: 'Packed & Ready at Hub', completed: false },
        { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
        { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
        { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
      ],
    };

    // 1. Register order globally in OrderContext & localStorage
    addOrderToSystem(orderSnapshot);
    if (selectedAddress?.contactNumber) {
      try {
        localStorage.setItem('apm_user_phone', selectedAddress.contactNumber);
      } catch {}
    }

    // 2. Reduce remaining slot capacity by 1
    if (selectedSlot) {
      bookSlot(selectedSlot.id);
    }

    // 3. Save lastOrder snapshot to state & localStorage
    setLastOrder(orderSnapshot);

    // 4. Clear current cart items
    clearCart();

    // 5. Navigate directly to confirmation screen
    onPaymentSuccess();
  };

  return (
    <Layout className="pb-0">
      <div className="flex flex-col min-h-screen bg-[var(--ivory)] pb-28 lg:pb-0">
        {/* Shared Top Header Bar */}
        <Header
          onNavigateToMenu={onBackToMenu}
          onNavigateToCart={onBackToCart}
          onNavigateToAdmin={onNavigateToAdmin}
          onNavigateToTrack={onNavigateToTrack}
        />

        <div className="flex-1 py-6 sm:py-8 flex flex-col gap-6">
          <Container className="flex flex-col gap-6 max-w-6xl">
            {/* Page Heading and StepTrack */}
            <PageHeading
              title="Review & Pay"
              onBack={onBackToAddress}
              currentStep={4}
            />

            {/* Two-Column Layout on Desktop / Single Column Stacked on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (65% width / 8 cols on desktop): Review Content */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Order Items Breakdown Card */}
                <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-2xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <h3 className="font-display font-bold text-xl text-[var(--mahogany)]">
                      Order Items ({cartItemsList.reduce((acc, i) => acc + i.quantity, 0)})
                    </h3>
                    <button
                      type="button"
                      onClick={onBackToCart}
                      className="text-xs font-sans text-[var(--crimson)] font-semibold underline hover:text-[var(--crimson-dark)] cursor-pointer"
                    >
                      Edit Cart
                    </button>
                  </div>

                  {/* Compact Cart Line Items List */}
                  <div className="flex flex-col divide-y divide-[var(--line)]/60">
                    {cartItemsList.map(({ item, quantity }) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-lg border border-[var(--line)] aspect-square overflow-hidden shrink-0 flex items-center justify-center text-white relative shadow-2xs"
                            style={{
                              background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                            }}
                          >
                            <span className="font-serif text-xs font-bold opacity-90 drop-shadow-xs">
                              {item.name.slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-sans font-semibold text-sm text-[var(--mahogany)] truncate">
                              {item.name}
                            </span>
                            <span className="font-mono text-xs text-[var(--mahogany-soft)] opacity-75">
                              Qty: {quantity} × ₹{item.price}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-sm text-[var(--mahogany)] shrink-0">
                          ₹{(item.price * quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Details Recap Card */}
                <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-2xs flex flex-col gap-4">
                  <h3 className="font-display font-bold text-xl text-[var(--mahogany)] border-b border-[var(--line)] pb-3">
                    Delivery Details
                  </h3>

                  <div className="flex flex-col gap-4 divide-y divide-[var(--line)]/60">
                    {/* Slot Recap Row */}
                    <div className="flex items-start justify-between gap-4 pt-1">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-[var(--ivory-warm)] border border-[var(--line)] text-[var(--gold-dark)] shrink-0 mt-0.5">
                          <Clock className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--gold-dark)] font-bold">
                            Selected Slot
                          </span>
                          <span className="font-sans font-bold text-sm text-[var(--mahogany)] truncate">
                            {selectedSlot ? selectedSlot.timeWindow : 'Default Evening Slot'}
                          </span>
                          <span className="font-sans text-xs text-[var(--mahogany-soft)] opacity-75 truncate">
                            {selectedSlot?.cutoffLabel}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={onBackToSlot}
                        className="text-xs font-sans font-semibold text-[var(--crimson)] hover:underline shrink-0"
                      >
                        Change
                      </button>
                    </div>

                    {/* Address Recap Row */}
                    <div className="flex items-start justify-between gap-4 pt-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-[var(--ivory-warm)] border border-[var(--line)] text-[var(--crimson)] shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--crimson)] font-bold">
                            Delivery Address
                          </span>
                          <span className="font-sans font-bold text-sm text-[var(--mahogany)] truncate">
                            {selectedAddress ? `${selectedAddress.fullName || selectedAddress.tag} · ${selectedAddress.fullAddress}` : 'No address selected'}
                          </span>
                          <span className="font-mono text-xs text-[var(--mahogany-soft)] opacity-75 truncate">
                            Phone: {selectedAddress?.contactNumber}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={onBackToAddress}
                        className="text-xs font-sans font-semibold text-[var(--crimson)] hover:underline shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-2xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <h3 className="font-display font-bold text-xl text-[var(--mahogany)]">
                      Payment Mode
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>256-Bit Encrypted</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'upi', label: 'UPI / GPay / PhonePe', note: 'Instant confirmation' },
                      { id: 'card', label: 'Credit / Debit Card', note: 'Visa, Mastercard, RuPay' },
                      { id: 'cod', label: 'Cash on Delivery', note: 'Pay at doorstep' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`
                          p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer
                          ${
                            paymentMethod === pm.id
                              ? 'bg-[var(--ivory-warm)] border-[var(--crimson)] ring-2 ring-[var(--crimson)]/20 shadow-2xs'
                              : 'bg-white border-[var(--line)] hover:border-[var(--mahogany)]/30'
                          }
                        `}
                      >
                        <span className="font-sans font-bold text-xs text-[var(--mahogany)]">
                          {pm.label}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--mahogany-soft)] opacity-75">
                          {pm.note}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (35% width / 4 cols on desktop): Sticky Summary & Pay CTA */}
              <div className="lg:col-span-4 sticky top-24">
                <SummaryCard
                  ctaText={isProcessing ? 'Processing Order...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} & Confirm`}
                  onCtaClick={handlePayment}
                  ctaDisabled={isProcessing}
                />

                <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[11px] font-mono text-[var(--mahogany-soft)] opacity-75">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit Encrypted Payment Confirmation</span>
                </div>
              </div>

            </div>
          </Container>
        </div>

        {/* Mobile Fixed Bottom Pay Action Bar (<1024px) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--mahogany)] text-[var(--ivory)] border-t border-white/10 p-4 shadow-[0_-6px_20px_rgba(44,24,16,0.35)] backdrop-blur-md">
          <Container className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[10px] text-white/70 uppercase tracking-wider">To Pay</span>
              <span className="font-mono font-bold text-lg text-[var(--gold)]">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePayment}
              className="
                flex items-center gap-2 font-sans font-bold text-sm px-6 py-3.5 rounded-xl
                bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)] active:scale-95 transition-all
                shadow-md cursor-pointer shrink-0 border border-white/10
              "
            >
              <CreditCard className="w-4 h-4 stroke-[2.5] text-[var(--gold)]" />
              <span>{isProcessing ? 'Processing...' : 'Pay & Confirm'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </Container>
        </div>

        <Toast />
      </div>
    </Layout>
  );
};
