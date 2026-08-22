import type { FC } from 'react';
import type { MenuItem } from '../types/menu';
import { useCart } from '../context/CartContext';

export interface GhewarSpotlightProps {
  item: MenuItem;
  className?: string;
}

export const GhewarSpotlight: FC<GhewarSpotlightProps> = ({ item, className = '' }) => {
  const { addToCart } = useCart();

  return (
    <div className={`w-full ${className}`}>
      <div
        onClick={() => addToCart(item.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            addToCart(item.id);
          }
        }}
        className="
          relative w-full rounded-[18px] p-4 sm:p-5 bg-gradient-to-br from-[#FFF8EC] to-[#FCEDCB]
          border border-[var(--gold)]/40 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
          transition-all duration-200 cursor-pointer active:scale-[0.995]
          flex items-center gap-4 sm:gap-6 group overflow-hidden
        "
      >
        {/* Badge: Overlapping top-left edge */}
        <div className="absolute -top-1 left-4 sm:left-6 bg-[var(--gold)] text-[var(--red-dark)] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-[var(--gold-dark)]/30 tracking-wide uppercase z-10">
          ★ Signature
        </div>

        {/* 84x84px Radial Gradient Concentric Disc Thumbnail */}
        <div className="relative w-[84px] h-[84px] min-w-[84px] min-h-[84px] sm:w-[96px] sm:h-[96px] sm:min-w-[96px] sm:min-h-[96px] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center bg-gradient-to-br from-[#F5B041] via-[#D35400] to-[#7E5109] border border-amber-400/40 shrink-0">
          {/* Concentric Dashed Ring SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full p-1 opacity-70" viewBox="0 0 84 84">
            <circle
              cx="42"
              cy="42"
              r="34"
              fill="none"
              stroke="#FFF"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <circle
              cx="42"
              cy="42"
              r="22"
              fill="none"
              stroke="#F0A020"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <circle cx="42" cy="42" r="10" fill="none" stroke="#FFF" strokeWidth="1" />
          </svg>
          <span className="font-display italic text-amber-100 font-bold text-lg sm:text-xl drop-shadow z-10">
            APM
          </span>
        </div>

        {/* Info Column */}
        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <h3 className="font-display font-bold text-[20px] sm:text-[22px] text-[var(--mahogany)] leading-tight tracking-tight group-hover:text-[var(--crimson)] transition-colors">
            {item.name}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[var(--mahogany-soft)] opacity-85 line-clamp-2">
            {item.description}
          </p>

          {/* Footer Row */}
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-[var(--mahogany)]/10">
            <span className="font-mono font-bold text-base sm:text-lg text-[var(--red-dark)]">
              ₹{item.price}
            </span>
            <span className="font-mono text-[11px] sm:text-xs font-semibold text-[var(--gold-dark)] bg-white/70 px-2.5 py-0.5 rounded-full border border-[var(--gold)]/30">
              Only {item.stock} left today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
