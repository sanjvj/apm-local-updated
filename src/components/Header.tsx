import type { FC } from 'react';
import { Container } from './Container';
import { BrandLogo } from './BrandLogo';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Truck, ShieldAlert } from 'lucide-react';

export interface HeaderProps {
  onNavigateToMenu?: () => void;
  onNavigateToCart?: () => void;
  onNavigateToTrack?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToAdmin?: () => void;
}

export const Header: FC<HeaderProps> = ({
  onNavigateToMenu,
  onNavigateToCart,
  onNavigateToTrack,
  onNavigateToOrders,
  onNavigateToAdmin,
}) => {
  const { totalItems } = useCart();

  return (
    <header className="w-full bg-[var(--ivory)] border-b border-[var(--line)] py-3 sm:py-4 sticky top-0 z-50 shadow-2xs">
      <Container className="flex items-center justify-between gap-4">
        {/* Left: Brand Lockup Link back to Menu */}
        <button
          type="button"
          onClick={onNavigateToMenu}
          aria-label="AM Madurai Home"
          className="hover:opacity-90 transition-opacity text-left cursor-pointer"
        >
          <BrandLogo variant="full" badgeSize="sm" />
        </button>

        {/* Right Side Actions: Pincode Check, Your Orders, Track Order, Admin & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pincode Location Check Badge */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('apm_open_pincode_modal'));
            }}
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300
              text-xs font-sans font-semibold text-amber-900 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs
            "
            title="Check Delivery Availability by Pincode"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-bold text-[11px]">Check Pincode</span>
          </button>

          {/* Your Orders Button */}
          {onNavigateToOrders && (
            <button
              type="button"
              onClick={onNavigateToOrders}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B1A1A]/10 border border-[#8B1A1A]/30
                text-xs font-sans font-semibold text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white transition-all cursor-pointer
              "
              title="Your Orders"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Your Orders</span>
            </button>
          )}

          {/* Track Order Button */}
          {onNavigateToTrack && (
            <button
              type="button"
              onClick={onNavigateToTrack}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--ivory-warm)] border border-[var(--line)]
                text-xs font-sans font-semibold text-[var(--mahogany)] hover:bg-[var(--mahogany)]/5 transition-all cursor-pointer
              "
              title="Track Order Status"
            >
              <Truck className="w-3.5 h-3.5 text-[var(--gold-dark)]" />
              <span className="hidden sm:inline">Track Order</span>
            </button>
          )}

          {/* Rider Portal Switcher */}
          <a
            href="/delivery"
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-700 text-white
              hover:bg-emerald-800 text-xs font-sans font-bold transition-all shadow-2xs cursor-pointer border border-emerald-500/30
            "
            title="Switch to Delivery Rider Portal"
          >
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Rider Portal</span>
          </a>

          {/* Admin Dashboard Switcher */}
          {onNavigateToAdmin && (
            <button
              type="button"
              onClick={onNavigateToAdmin}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--mahogany)] text-[var(--gold)]
                hover:bg-[var(--mahogany-soft)] text-xs font-sans font-bold transition-all shadow-2xs cursor-pointer
              "
              title="Switch to Admin Dashboard"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Cart Icon with Item Count Badge */}
          {onNavigateToCart && (
            <button
              type="button"
              onClick={onNavigateToCart}
              aria-label={`Shopping Cart with ${totalItems} items`}
              className="
                relative p-2.5 rounded-full bg-white border border-[var(--line)]
                text-[var(--mahogany)] hover:bg-[var(--ivory-warm)] transition-colors cursor-pointer shadow-2xs
              "
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalItems > 0 && (
                <span className="
                  absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--crimson)] text-white
                  font-mono text-[10px] font-bold flex items-center justify-center shadow-xs border-2 border-white animate-scale-in
                ">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </Container>
    </header>
  );
};
