import type { FC, ReactNode } from 'react';

export interface SectionHeaderProps {
  title: string;
  note?: ReactNode;
  className?: string;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ title, note, className = '' }) => {
  return (
    <div className={`flex items-baseline justify-between w-full pt-4 pb-2 ${className}`}>
      <h2 className="font-display font-bold text-[22px] sm:text-[24px] text-[var(--mahogany)] tracking-tight leading-none">
        {title}
      </h2>
      {note && (
        <span className="font-mono text-xs sm:text-sm font-medium text-[var(--mahogany-soft)] opacity-75">
          {note}
        </span>
      )}
    </div>
  );
};
