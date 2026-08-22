import type { FC } from 'react';
import { useCart } from '../context/CartContext';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Container } from './Container';

export interface StickyCartBarProps {
  onViewCart?: () => void;
  className?: string;
}

export const StickyCartBar: FC<StickyCartBarProps> = ({ onViewCart, className = '' }) => {
  const { totalItems, subtotal } = useCart();

  if (totalItems === 0) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50 w-full bg-[var(--mahogany)] text-[var(--ivory)]
        border-t border-white/10 py-3 shadow-[0_-6px_20px_rgba(44,24,16,0.25)]
        transition-all transform duration-300 ease-out animate-slide-up
        ${className}
      `}
    >
      <style>{`
        @keyframes slideUpCart {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUpCart 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up {
            animation: none !important;
          }
        }
      `}</style>

      <Container className="flex items-center justify-between">
        {/* Left side: Item count & Subtotal */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[var(--gold)]">
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs text-white/70">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
            </span>
            <span className="font-mono font-bold text-base sm:text-lg text-[var(--gold)]">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right side: View Cart button */}
        <button
          type="button"
          onClick={() => {
            if (onViewCart) {
              onViewCart();
            } else {
              alert(`Navigating to Cart (Subtotal: ₹${subtotal})`);
            }
          }}
          className="
            flex items-center gap-2 bg-[var(--gold)] text-[var(--mahogany)] font-sans font-bold text-sm
            px-4 sm:px-6 py-2.5 rounded-xl hover:bg-[var(--gold-dark)] active:scale-95 transition-all duration-150 shadow-sm cursor-pointer
          "
        >
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </Container>
    </div>
  );
};
