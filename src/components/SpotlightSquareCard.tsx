import type { FC } from 'react';
import type { MenuItem } from '../types/menu';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';

export interface SpotlightSquareCardProps {
  item: MenuItem;
  className?: string;
}

export const SpotlightSquareCard: FC<SpotlightSquareCardProps> = ({ item, className = '' }) => {
  const { addToCart } = useCart();
  const gradientColors = item?.gradient || ['#F0A020', '#C8860A'];

  if (!item) return null;

  return (
    <div
      onClick={() => addToCart(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          addToCart(item.id);
        }
      }}
      className={`
        w-full aspect-square relative rounded-[var(--radius)] overflow-hidden
        border border-[var(--gold)]/40 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]
        transition-all duration-200 cursor-pointer group active:scale-[0.99] ${className}
      `}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
      }}
    >
      {/* If custom image URL is provided, display image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <>
          {/* Concentric Dashed Ring SVG Decorative Background Overlay */}
          <svg className="absolute inset-0 w-full h-full p-4 opacity-35 pointer-events-none" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#FFF" strokeWidth="2" strokeDasharray="8 6" />
            <circle cx="100" cy="100" r="55" fill="none" stroke="#F0A020" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="100" cy="100" r="25" fill="none" stroke="#FFF" strokeWidth="1.5" />
          </svg>

          {/* Center Decorative Branding Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-display italic text-white/25 font-bold text-4xl sm:text-5xl drop-shadow select-none">
              AM
            </span>
          </div>
        </>
      )}

      {/* Top-Left Pill Badge: ★ Signature */}
      <div className="absolute top-3 left-3 z-10 bg-[var(--gold)] text-[var(--red-dark)] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-[var(--gold-dark)]/30 tracking-wide uppercase">
        ★ Signature
      </div>

      {/* Top-Right Pill Badge: Stock Tag */}
      <div className="absolute top-3 right-3 z-10 bg-black/45 backdrop-blur-xs text-white border border-white/20 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
        Only {item.stock || 12} left today
      </div>

      {/* Bottom Third Dark Gradient Scrim */}
      <div className="absolute inset-x-0 bottom-0 z-10 pt-16 pb-3.5 px-4 bg-gradient-to-t from-[rgba(44,24,16,0.92)] via-[rgba(44,24,16,0.6)] to-transparent flex flex-col gap-1.5 justify-end">
        <h3 className="font-display font-bold text-[19px] sm:text-[20px] text-[var(--ivory)] leading-tight tracking-tight group-hover:text-[var(--gold)] transition-colors">
          {item.name}
        </h3>

        <div className="flex items-center justify-between mt-0.5">
          <span className="font-mono font-bold text-[16px] text-[var(--gold)]">
            ₹{item.price}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item.id);
            }}
            className="
              px-3.5 py-1 rounded-full bg-[var(--gold)] text-[var(--red-dark)]
              hover:bg-[var(--gold-dark)] hover:text-white active:scale-95
              font-sans font-bold text-xs shadow-sm transition-all duration-150 flex items-center gap-1 cursor-pointer
            "
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
