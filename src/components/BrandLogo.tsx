import type { FC } from 'react';

export interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'badge-only';
  className?: string;
  badgeSize?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light' | 'gold' | 'auto';
  textColor?: string;
}

export const BrandLogo: FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  badgeSize = 'md',
  theme = 'auto',
  textColor,
}) => {
  const badgePixelSize = {
    sm: 36,
    md: 44,
    lg: 56,
  }[badgeSize];

  const isDarkBackground = theme === 'dark' || theme === 'gold' || (textColor && (textColor.includes('white') || textColor.includes('ivory')));

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Handcrafted AM Beaded Gold Seal Emblem */}
      <svg
        width={badgePixelSize}
        height={badgePixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <radialGradient id="amGoldGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF1D0" />
            <stop offset="60%" stopColor="#E5A93B" />
            <stop offset="100%" stopColor="#B3781A" />
          </radialGradient>
          <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Beaded Dot Ring (24 gold beads) */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const cx = 50 + 44 * Math.cos(rad);
          const cy = 50 + 44 * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={1.8}
              fill="url(#amGoldGrad)"
            />
          );
        })}

        {/* Thin Inner Gold Ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="url(#amGoldGrad)"
          strokeWidth="1.5"
          fill="rgba(30, 6, 8, 0.45)"
        />
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="rgba(229, 169, 59, 0.3)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />

        {/* AM Monogram in Noto Serif Italic */}
        <text
          x="50"
          y="57"
          textAnchor="middle"
          fill="url(#amGoldGrad)"
          fontFamily="'Noto Serif', Georgia, serif"
          fontSize="29"
          fontStyle="italic"
          fontWeight="600"
          letterSpacing="0.5"
          filter="url(#glowGold)"
        >
          AM
        </text>
      </svg>

      {/* Typography Lockup */}
      {variant !== 'badge-only' && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display font-bold tracking-[0.14em] uppercase transition-colors ${
              badgeSize === 'sm'
                ? 'text-sm sm:text-base'
                : badgeSize === 'lg'
                ? 'text-xl sm:text-2xl'
                : 'text-base sm:text-lg'
            } ${isDarkBackground ? 'text-[#FAF7F2]' : 'text-[#2C1810]'}`}
          >
            AM MADURAI
          </span>
          <span
            className={`font-sans font-semibold tracking-[0.22em] text-[8px] sm:text-[9px] uppercase mt-0.5 ${
              isDarkBackground ? 'text-[#E5A93B]' : 'text-[#8B1A1A]'
            }`}
          >
            TRADITION. HANDCRAFTED.
          </span>
        </div>
      )}
    </div>
  );
};
