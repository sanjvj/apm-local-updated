import type { FC } from 'react';
import type { DeliverySlot } from '../types/slot';

export interface SlotCardProps {
  slot: DeliverySlot;
  isSelected?: boolean;
  onSelect?: (slotId: string) => void;
  day?: 'today' | 'tomorrow';
  className?: string;
}

// Utility to calculate whether current local time has passed the slot cutoff
export function isCutoffPassed(cutoffTime24h?: string, cutoffLabel?: string): boolean {
  let hour = -1;
  let minute = 0;

  if (cutoffTime24h) {
    const parts = cutoffTime24h.split(':').map(Number);
    hour = parts[0];
    minute = parts[1] || 0;
  } else if (cutoffLabel) {
    const match = cutoffLabel.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      hour = h;
      minute = m;
    }
  }

  if (hour < 0) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentHour > hour) return true;
  if (currentHour === hour && currentMinute >= minute) return true;

  return false;
}

export const SlotCard: FC<SlotCardProps> = ({
  slot,
  isSelected = false,
  onSelect,
  day = 'today',
  className = '',
}) => {
  const isTomorrow = day === 'tomorrow';
  const filledCount = isTomorrow ? 0 : slot.filled;
  const spotsLeft = Math.max(0, slot.capacity - filledCount);
  const isFull = spotsLeft === 0 || filledCount >= slot.capacity;
  
  // Cutoff only applies to Today's slots, not Tomorrow's pre-orders
  const cutoffPassed = isTomorrow ? false : isCutoffPassed(slot.cutoffTime24h, slot.cutoffLabel);
  const isDisabled = isFull || cutoffPassed;

  // SVG Progress Ring calculations (54px diameter, r=23, circumference = 2 * PI * 23 = ~144.5)
  const radius = 23;
  const circumference = 2 * Math.PI * radius;
  const percentFilled = Math.min(100, Math.max(0, (filledCount / slot.capacity) * 100));
  const strokeDashoffset = circumference - (percentFilled / 100) * circumference;

  const strokeColor = isDisabled ? 'var(--crimson)' : 'var(--gold)';

  return (
    <div
      onClick={() => {
        if (!isDisabled && onSelect) {
          onSelect(slot.id);
        }
      }}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (!isDisabled && onSelect && (e.key === 'Enter' || e.key === ' ')) {
          onSelect(slot.id);
        }
      }}
      className={`
        w-full rounded-[var(--radius)] p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-200 select-none
        ${
          isDisabled
            ? 'opacity-60 pointer-events-none cursor-not-allowed bg-gray-50/80 border-[1.5px] border-[var(--line)]'
            : isSelected
            ? 'bg-gradient-to-r from-[var(--ivory-warm)]/70 to-white border-[1.5px] border-[var(--crimson)] shadow-sm ring-1 ring-[var(--crimson)]/30 cursor-pointer'
            : 'bg-white hover:bg-white/90 border-[1.5px] border-[var(--line)] shadow-2xs hover:shadow-xs cursor-pointer'
        }
        ${className}
      `}
    >
      {/* Left: 54px Circular SVG Progress Ring */}
      <div className="relative w-[54px] h-[54px] min-w-[54px] min-h-[54px] flex items-center justify-center shrink-0">
        <svg className="w-[54px] h-[54px] transform -rotate-90" viewBox="0 0 54 54">
          {/* Background track circle */}
          <circle
            cx="27"
            cy="27"
            r={radius}
            stroke="rgba(44, 24, 16, 0.1)"
            strokeWidth="4"
            fill="none"
          />
          {/* Progress ring circle */}
          <circle
            cx="27"
            cy="27"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Remaining spots center label */}
        <span
          className={`
            absolute font-mono font-bold text-sm
            ${isDisabled ? 'text-[var(--crimson)]' : 'text-[var(--mahogany)]'}
          `}
        >
          {spotsLeft}
        </span>
      </div>

      {/* Middle: Time Window, Cutoff Label, Spots Capacity & Realtime Cutoff Status */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className="font-display font-bold text-[18px] sm:text-[20px] text-[var(--mahogany)] leading-none truncate">
          {slot.timeWindow}
        </h3>

        <span className="font-sans text-xs text-[var(--mahogany-soft)] opacity-80 truncate">
          {isTomorrow
            ? slot.cutoffLabel.replace('today', 'tomorrow')
            : slot.cutoffLabel}
        </span>

        <div className="mt-0.5">
          {cutoffPassed ? (
            <span className="font-mono text-xs font-bold text-[var(--crimson)]">
              Cutoff Time Passed — Closed for Today
            </span>
          ) : isFull ? (
            <span className="font-mono text-xs font-bold text-[var(--crimson)]">
              Slot full — try next window
            </span>
          ) : (
            <span className="font-mono text-xs font-bold text-[var(--gold-dark)]">
              {spotsLeft} of {slot.capacity} spots left
            </span>
          )}
        </div>
      </div>

      {/* Right: Radio-style selection indicator (hidden on disabled slots) */}
      {!isDisabled && (
        <div className="shrink-0 flex items-center justify-center">
          <div
            className={`
              w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center
              ${
                isSelected
                  ? 'border-[var(--crimson)] bg-white'
                  : 'border-[var(--line)] bg-transparent'
              }
            `}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--crimson)] animate-scale-in" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
