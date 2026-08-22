import type { FC, ReactNode } from 'react';
import { useCart } from '../context/CartContext';
import { useSlots } from '../context/SlotContext';
import type { SavedAddress } from '../types/address';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export interface SummaryCardProps {
  showSlotRecap?: boolean;
  onChangeSlot?: () => void;
  selectedAddress?: SavedAddress | null;
  ctaText?: string;
  ctaDisabled?: boolean;
  onCtaClick?: () => void;
  onContinueShopping?: () => void;
  customFooterNote?: ReactNode;
  className?: string;
}

export const SummaryCard: FC<SummaryCardProps> = ({
  showSlotRecap = true,
  onChangeSlot,
  selectedAddress,
  ctaText = 'Continue to Payment',
  ctaDisabled = false,
  onCtaClick,
  onContinueShopping,
  customFooterNote,
  className = '',
}) => {
  const { cartItemsList, totalItems, subtotal, selectedSlotId } = useCart();
  const { slots } = useSlots();

  // Selected slot lookup
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  // Business Logic: Delivery fee ₹40 if subtotal < 300, FREE if subtotal >= 300
  const deliveryThreshold = 300;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const toPay = subtotal + deliveryFee;

  return (
    <div className={`bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 sm:p-6 shadow-sm flex flex-col gap-4 ${className}`}>
      {/* Title */}
      <h3 className="font-display font-bold text-xl text-[var(--mahogany)] border-b border-[var(--line)] pb-3">
        Order Summary
      </h3>

      {/* 1. Selected Slot Recap Row */}
      {showSlotRecap && (
        <div className="bg-[var(--ivory-warm)]/60 border border-[var(--line)] rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white text-[var(--gold-dark)] flex items-center justify-center shrink-0 shadow-2xs border border-[var(--line)]">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--gold-dark)] font-bold">
                Selected Slot
              </span>
              <span className="font-display font-semibold text-sm sm:text-base text-[var(--mahogany)] truncate">
                {selectedSlot ? selectedSlot.timeWindow : 'No slot chosen'}
              </span>
            </div>
          </div>

          {onChangeSlot && (
            <button
              type="button"
              onClick={onChangeSlot}
              className="text-xs font-sans text-[var(--crimson)] font-semibold underline hover:text-[var(--crimson-dark)] shrink-0 cursor-pointer"
            >
              Change
            </button>
          )}
        </div>
      )}

      {/* 2. Compact Line-Items Summary List */}
      {cartItemsList.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--mahogany-soft)] font-bold opacity-75">
            Cart Items ({totalItems})
          </span>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {cartItemsList.map(({ item, quantity }) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-xs sm:text-sm font-sans">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-[var(--mahogany)] font-medium truncate">
                    {item.name}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--mahogany-soft)] shrink-0">
                    × {quantity}
                  </span>
                </div>
                <span className="font-mono font-semibold text-[var(--mahogany)] shrink-0">
                  ₹{(item.price * quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          {/* Thin divider below line items */}
          <div className="border-t border-[var(--line)]/60 my-1" />
        </div>
      )}

      {/* 3. Cost & Breakdown Block */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between items-center text-[var(--mahogany-soft)]">
          <span className="font-sans">Order Subtotal</span>
          <span className="font-mono font-semibold text-[var(--mahogany)] text-base">
            ₹{subtotal.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-between items-center text-[var(--mahogany-soft)]">
          <span className="font-sans">Delivery Fee</span>
          {isFreeDelivery ? (
            <span className="font-mono font-bold text-[var(--success)]">
              FREE
            </span>
          ) : (
            <span className="font-mono font-semibold text-[var(--mahogany)]">
              ₹{deliveryFee}
            </span>
          )}
        </div>

        <div className="border-t border-dashed border-[var(--line)] my-1" />

        <div className="flex justify-between items-baseline">
          <span className="font-sans font-bold text-base text-[var(--mahogany)]">
            To Pay
          </span>
          <span className="font-mono font-bold text-2xl text-[var(--red-dark)]">
            ₹{toPay.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* 4. Selected Address Highlight (if provided) */}
      {selectedAddress && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs font-sans text-emerald-950 mt-1">
          <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold">Delivering to {selectedAddress.fullName || selectedAddress.tag}</span>
            <span className="truncate opacity-80">{selectedAddress.fullAddress}</span>
          </div>
        </div>
      )}

      {/* 5. Desktop Primary CTA Button & Links */}
      {onCtaClick && (
        <div className="hidden lg:flex flex-col gap-2 pt-2">
          <button
            type="button"
            disabled={ctaDisabled}
            onClick={onCtaClick}
            className={`
              w-full py-3.5 px-5 rounded-xl font-sans font-bold text-sm transition-all duration-150
              shadow-md flex items-center justify-center gap-2 cursor-pointer
              ${
                ctaDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 shadow-none'
                  : 'bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)] active:scale-[0.99]'
              }
            `}
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {onContinueShopping && (
            <button
              type="button"
              onClick={onContinueShopping}
              className="text-xs font-sans text-[var(--mahogany-soft)] hover:text-[var(--mahogany)] text-center font-medium hover:underline py-1 cursor-pointer"
            >
              Continue Browsing Menu
            </button>
          )}
        </div>
      )}

      {/* Optional custom footer note */}
      {customFooterNote}
    </div>
  );
};
