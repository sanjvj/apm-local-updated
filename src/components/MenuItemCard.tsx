import type { FC } from 'react';
import type { MenuItem } from '../types/menu';
import { useCart } from '../context/CartContext';
import { Plus, Minus } from 'lucide-react';

export interface MenuItemCardProps {
  item: MenuItem;
  className?: string;
}

export const MenuItemCard: FC<MenuItemCardProps> = ({ item, className = '' }) => {
  const { getItemQty, addToCart, removeFromCart } = useCart();
  const quantity = getItemQty(item.id);
  const isOutOfStock = item.isOutOfStock || false;

  // Defensive fallback for gradient to prevent runtime undefined errors
  const safeGradient = Array.isArray(item?.gradient) && item.gradient.length >= 2
    ? item.gradient
    : ['#C0202A', '#F0A020'];

  const formattedCategoryLabel = item.category
    .replace(/-/g, ' ')
    .toUpperCase();

  return (
    <div
      className={`
        bg-white border border-[var(--line)] rounded-[var(--radius)] overflow-hidden shadow-2xs
        hover:shadow-md transition-all duration-200 flex flex-col h-full group select-none
        ${isOutOfStock ? 'opacity-65' : ''}
        ${className}
      `}
    >
      {/* Aspect Ratio 1:1 Image Container */}
      <div
        className="w-full aspect-square relative overflow-hidden flex items-center justify-center text-white"
        style={{
          background: `linear-gradient(135deg, ${safeGradient[0]}, ${safeGradient[1]})`,
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
          /* Fallback typography initials watermark */
          <div className="flex flex-col items-center justify-center p-4 text-center z-0">
            <span className="font-serif text-3xl sm:text-4xl font-bold opacity-90 drop-shadow-sm tracking-wider">
              {item.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="font-sans text-[10px] tracking-widest uppercase opacity-75 mt-1 font-semibold">
              Annapoorna
            </span>
          </div>
        )}

        {/* Top-Left Category Overlay Tag */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="
            px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white
            font-mono text-[9px] font-bold tracking-wider uppercase border border-white/15 shadow-2xs
          ">
            {formattedCategoryLabel}
          </span>
        </div>

        {/* Stock Badge / Out of Stock Banner */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="px-3 py-1 bg-red-600 text-white font-mono text-xs font-bold uppercase rounded-md shadow-md">
              OUT OF STOCK
            </span>
          </div>
        ) : item.stockBadge ? (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span
              className={`
                px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase tracking-wide border shadow-2xs
                ${
                  item.badgeType === 'gold'
                    ? 'bg-[var(--gold)] text-[var(--mahogany)] border-[var(--gold-dark)]/30 font-bold'
                    : item.badgeType === 'dark'
                    ? 'bg-[var(--mahogany)] text-[var(--ivory)] border-white/20'
                    : 'bg-[var(--crimson)] text-white border-white/20'
                }
              `}
            >
              {item.stockBadge}
            </span>
          </div>
        ) : null}
      </div>

      {/* Card Content Below Image */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        {/* Name, Meta & Price */}
        <div className="flex flex-col gap-1">
          <h3
            className="font-display font-semibold text-[15px] sm:text-[16px] text-[var(--mahogany)] leading-snug line-clamp-2 min-h-[40px] group-hover:text-[var(--crimson)] transition-colors"
            title={item.name}
          >
            {item.name}
          </h3>

          <div className="flex items-baseline justify-between gap-1 mt-0.5">
            <span className="font-mono font-bold text-base sm:text-lg text-[var(--red-dark)]">
              ₹{item.price.toLocaleString('en-IN')}
            </span>
            <span className="font-sans text-[11px] font-medium text-[var(--mahogany-soft)] opacity-75">
              {item.meta}
            </span>
          </div>
        </div>

        {/* Action Button: Full-width ADD or Stepper */}
        <div className="w-full pt-1">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full py-2 rounded-xl bg-gray-200 text-gray-500 font-sans font-bold text-xs cursor-not-allowed text-center"
            >
              Unavailable
            </button>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(item.id)}
              className="
                w-full py-2 px-3 rounded-xl bg-[var(--crimson)] text-white font-sans font-bold text-xs
                hover:bg-[var(--crimson-dark)] active:scale-[0.98] transition-all duration-150
                shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer
              "
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-[var(--ivory-warm)] border border-[var(--line)] rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                aria-label="Decrease quantity"
                className="w-6 h-6 rounded-lg bg-white text-[var(--mahogany)] hover:bg-[var(--mahogany)] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>
              <span className="font-mono font-bold text-xs text-[var(--mahogany)] px-2">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => addToCart(item.id)}
                aria-label="Increase quantity"
                className="w-6 h-6 rounded-lg bg-[var(--gold)] text-[var(--mahogany)] hover:bg-[var(--gold-dark)] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
