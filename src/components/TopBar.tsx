import type { ReactNode, FC } from 'react';
import { ChevronLeft } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export interface TopBarProps {
  title?: string;
  onBack?: () => void;
  variant?: 'bordered' | 'transparent' | 'default';
  alignTitle?: 'center' | 'left';
  rightElement?: ReactNode;
  showBack?: boolean;
  showBrandLogo?: boolean;
  className?: string;
}

export const TopBar: FC<TopBarProps> = ({
  title,
  onBack,
  variant = 'default',
  rightElement,
  showBack = true,
  showBrandLogo = true,
  className = '',
}) => {
  const isBordered = variant === 'bordered';

  return (
    <header
      className={`
        sticky top-0 z-40 w-full bg-[var(--ivory)]
        ${isBordered ? 'border-b border-[var(--line)]' : ''}
        px-4 sm:px-8 py-3 flex items-center transition-all duration-200
        ${className}
      `}
    >
      <div className="w-full flex items-center justify-between relative min-h-[40px] gap-3">
        {/* Left Area: Back Button + Brand Eyebrow & Title */}
        <div className="flex items-center gap-3 z-10 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="w-9 h-9 rounded-full bg-[var(--mahogany)]/5 hover:bg-[var(--mahogany)]/10 active:scale-95 flex items-center justify-center text-[var(--mahogany)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

          {title && (
            <div className="flex flex-col min-w-0 justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--gold-dark)] font-bold leading-none mb-0.5">
                Annapoorna Mithai
              </span>
              <h1 className="font-display font-semibold text-[20px] sm:text-[22px] text-[var(--mahogany)] tracking-tight truncate leading-none">
                {title}
              </h1>
            </div>
          )}
        </div>

        {/* Right Area: Full Brand Logo Lockup */}
        <div className="flex items-center justify-end z-10 shrink-0">
          {rightElement || (showBrandLogo && (
            <BrandLogo
              variant="full"
              badgeSize="sm"
              textColor="text-[var(--mahogany)]"
              className="hidden xs:flex"
            />
          ))}
        </div>
      </div>
    </header>
  );
};
