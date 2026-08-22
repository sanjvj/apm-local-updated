import type { FC } from 'react';
import type { Category, CategoryId } from '../types/menu';

export interface CategoryChipsProps {
  categories: Category[];
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  className?: string;
}

export const CategoryChips: FC<CategoryChipsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-2 ${className}`}>
      {/* Hide scrollbar CSS */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="flex items-center gap-2 min-w-max">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`
                px-4 py-1.5 rounded-full text-xs sm:text-sm font-sans font-medium transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-[var(--mahogany)] text-[var(--ivory)] font-semibold shadow-sm scale-[1.02]'
                    : 'bg-white/60 border border-[var(--line)] text-[var(--mahogany-soft)] hover:bg-[var(--mahogany)]/5 hover:border-[var(--mahogany)]/30'
                }
              `}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
