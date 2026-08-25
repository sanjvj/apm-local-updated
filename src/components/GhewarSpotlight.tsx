import type { FC } from 'react';
import type { MenuItem } from '../types/menu';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Sparkles, Check } from 'lucide-react';
import { useState } from 'react';

export interface GhewarSpotlightProps {
  item: MenuItem;
  className?: string;
}

export const GhewarSpotlight: FC<GhewarSpotlightProps> = ({ item, className = '' }) => {
  const { getItemQty, addToCart, removeFromCart } = useCart();
  const quantity = getItemQty(item.id);
  const [isAddedToast, setIsAddedToast] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item.id);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 1500);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className="
          relative w-full rounded-3xl p-5 sm:p-7
          bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F5EEE1]
          border-2 border-[#D4AF37]/50 shadow-md hover:shadow-xl
          transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 group overflow-hidden select-none
        "
      >
        {/* Background Decorative Glow */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#E5A93B]/10 blur-2xl pointer-events-none" />

        {/* Large Product Image Container */}
        <div className="relative w-full sm:w-52 sm:h-52 aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden shadow-md shrink-0 border border-[#EACFA5]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#DCA42B] to-[#915809] flex items-center justify-center text-white">
              <span className="font-display italic font-bold text-3xl">AM</span>
            </div>
          )}

          {/* Clean Non-Red Category Tag at Top Right Corner */}
          <div className="absolute top-3 right-3 z-10">
            <span className="px-3 py-1 rounded-full bg-[#2C1810]/85 backdrop-blur-md text-[#E5A93B] border border-[#D4AF37]/40 font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E5A93B]" />
              <span>Signature Special</span>
            </span>
          </div>
        </div>

        {/* Product Details Info Column */}
        <div className="flex flex-col flex-1 min-w-0 justify-between gap-3 w-full">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5A93B]/20 text-[#2C1810] font-mono text-[10px] font-bold uppercase border border-[#E5A93B]/40">
                Today's Special
              </span>
              {item.meta && (
                <span className="text-[11px] font-sans font-medium text-black/60">
                  • {item.meta}
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#2C1810] leading-tight tracking-tight group-hover:text-[#8B1A1A] transition-colors">
              {item.name}
            </h3>

            <p className="font-sans text-xs sm:text-sm text-[#2C1810]/75 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Pricing & Cart Stepper / Add Button */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#EACFA5]">
            <div className="flex flex-col">
              <span className="font-sans text-[10px] uppercase tracking-wider text-black/50 font-bold">
                Swiggy Price
              </span>
              <span className="font-mono font-bold text-xl sm:text-2xl text-[#8B1A1A]">
                ₹{item.price}
              </span>
            </div>

            <div className="shrink-0">
              {quantity === 0 ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`px-5 py-2.5 rounded-xl font-sans font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAddedToast
                      ? 'bg-emerald-600 text-white scale-105'
                      : 'bg-[#8B1A1A] hover:bg-[#6B0F14] text-white active:scale-95'
                  }`}
                >
                  {isAddedToast ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>ADDED</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-white border border-[#EACFA5] rounded-xl p-1.5 shadow-sm">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.id);
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F5EEE1] text-[#2C1810] hover:bg-[#8B1A1A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="font-mono font-bold text-sm text-[#2C1810] px-2">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="w-7 h-7 rounded-lg bg-[#E5A93B] text-[#2C1810] hover:bg-[#C8860A] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
