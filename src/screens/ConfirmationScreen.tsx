// TODO: replace with real APM WhatsApp Business number
import type { FC } from 'react';
import { useEffect } from 'react';
import { Container, Toast } from '../components';
import { useCart } from '../context/CartContext';
import { Check, Clock, MapPin, MessageCircle, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export interface ConfirmationScreenProps {
  onStartNewOrder: () => void;
  onRedirectToMenu: () => void;
  onNavigateToTrack?: (orderId: string) => void;
}

export const ConfirmationScreen: FC<ConfirmationScreenProps> = ({
  onStartNewOrder,
  onRedirectToMenu,
  onNavigateToTrack,
}) => {
  const { lastOrder, setLastOrder, clearCart } = useCart();

  // Guard: if no lastOrder exists, redirect to Menu
  useEffect(() => {
    if (!lastOrder) {
      onRedirectToMenu();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [lastOrder, onRedirectToMenu]);

  if (!lastOrder) return null;

  const handleStartNewOrder = () => {
    clearCart();
    setLastOrder(null);
    onStartNewOrder();
  };

  const whatsappNumber = '919876543210';
  const whatsappText = encodeURIComponent(
    `Hi! I just placed order ${lastOrder.orderId} on Annapoorna Mithai Local Delivery. Please send me updates!`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-[var(--ivory)] flex flex-col justify-center items-center py-12 px-4 select-none">
      <Container className="w-full max-w-[560px] flex flex-col items-center gap-6 text-center">

        {/* 1. On-Brand Crimson/Gold/Success Badge Visual (Announced via aria-live="polite") */}
        <div
          aria-live="polite"
          className="flex flex-col items-center gap-4 animate-scale-in"
        >
          <div className="relative w-20 h-20 rounded-full bg-[var(--ivory-warm)] border-2 border-[var(--gold)] flex items-center justify-center shadow-md">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--crimson-dark)] to-[var(--crimson)] text-white flex items-center justify-center shadow-inner">
              <Check className="w-8 h-8 stroke-[3] text-[var(--gold)]" />
            </div>
            {/* Pulsing ring glow */}
            <div className="absolute inset-0 rounded-full border-2 border-[var(--gold)]/40 animate-ping pointer-events-none" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--gold-dark)]">
              Payment Successful
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--mahogany)]">
              Order Confirmed!
            </h1>
          </div>
        </div>

        {/* 2. Order ID Pill Display */}
        <div className="bg-white border border-[var(--line)] rounded-xl px-5 py-2.5 shadow-2xs flex items-center gap-2">
          <span className="font-sans text-xs text-[var(--mahogany-soft)]">Order ID:</span>
          <span className="font-mono font-bold text-base text-[var(--crimson)] tracking-wide">
            {lastOrder.orderId}
          </span>
        </div>

        {/* 3. Slot Recap Card */}
        {lastOrder.slot && (
          <div className="w-full bg-white border border-[var(--line)] rounded-[var(--radius)] p-4 shadow-2xs flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-full bg-[var(--ivory-warm)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--gold-dark)]">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--gold-dark)] font-bold">
                Delivery Window
              </span>
              <span className="font-display font-bold text-lg text-[var(--mahogany)] truncate">
                Arriving {lastOrder.slot.timeWindow}
              </span>
              <span className="font-sans text-xs text-[var(--mahogany-soft)] opacity-75 truncate">
                {lastOrder.slot.cutoffLabel}
              </span>
            </div>
          </div>
        )}

        {/* 4. Delivery Address Recap Card */}
        {lastOrder.address && (
          <div className="w-full bg-white border border-[var(--line)] rounded-[var(--radius)] p-4 shadow-2xs flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-full bg-[var(--ivory-warm)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--crimson)]">
              <MapPin className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--crimson)] font-bold">
                Delivering To
              </span>
              <span className="font-sans font-bold text-sm text-[var(--mahogany)] truncate">
                {lastOrder.address.tag} · {lastOrder.address.fullAddress}
              </span>
              <span className="font-mono text-xs text-[var(--mahogany-soft)] opacity-75 truncate">
                Pincode: {lastOrder.address.pincode}
              </span>
            </div>
          </div>
        )}

        {/* 5. Order Total Recap (Small & Secondary) */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-[var(--mahogany-soft)] px-2">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{lastOrder.items.length} items ordered</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[var(--mahogany)]">
            <span>Total Paid:</span>
            <span className="text-[var(--red-dark)]">₹{lastOrder.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 6. Live Track Order Button */}
        {onNavigateToTrack && (
          <button
            type="button"
            onClick={() => onNavigateToTrack(lastOrder.orderId)}
            className="
              w-full py-3.5 px-4 rounded-xl bg-[var(--gold)] text-[var(--mahogany)] font-sans font-bold text-sm
              hover:bg-[var(--gold-dark)] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer
            "
          >
            <Truck className="w-4 h-4 stroke-[2.5]" />
            <span>Track Order Live</span>
          </button>
        )}

        {/* 7. WhatsApp Deep-Link Action Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact Annapoorna Mithai support on WhatsApp for order updates"
          className="
            w-full py-3 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--mahogany)]
            hover:bg-emerald-50/60 hover:border-emerald-300 font-sans font-semibold text-xs sm:text-sm
            transition-all duration-150 shadow-2xs flex items-center justify-center gap-2 cursor-pointer
          "
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
          <span>Get updates on WhatsApp</span>
        </a>

        {/* 8. Start New Order Primary CTA */}
        <button
          type="button"
          onClick={handleStartNewOrder}
          className="
            w-full py-4 px-6 rounded-xl bg-[var(--crimson)] text-white font-sans font-bold text-sm sm:text-base
            hover:bg-[var(--crimson-dark)] active:scale-[0.99] transition-all duration-150 shadow-md
            flex items-center justify-center gap-2 cursor-pointer mt-2
          "
        >
          <span>Start New Order</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

      </Container>
      <Toast />
    </div>
  );
};
