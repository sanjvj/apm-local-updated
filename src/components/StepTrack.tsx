import type { FC } from 'react';

export interface StepTrackProps {
  /** 
   * Array of 4 fill numbers (0 to 100) for each segment.
   * If provided, overrides default currentStep fill calculation.
   */
  progress?: [number, number, number, number] | number[];
  
  /** 
   * Active step index (0 to 3):
   * 0: Cart
   * 1: Slot Select
   * 2: Address
   * 3: Payment
   */
  currentStep?: number;

  /** Optional step labels */
  labels?: string[];
  showLabels?: boolean;
  className?: string;
}

const DEFAULT_LABELS = ['Cart', 'Slot', 'Address', 'Payment'];

export const StepTrack: FC<StepTrackProps> = ({
  progress,
  currentStep = 0,
  labels = DEFAULT_LABELS,
  showLabels = false,
  className = '',
}) => {
  // Determine fill percentage (0-100) for each of the 4 segments
  const segmentFills: number[] = Array.from({ length: 4 }, (_, i) => {
    if (progress && typeof progress[i] === 'number') {
      return Math.min(100, Math.max(0, progress[i]));
    }
    if (i < currentStep) return 100;
    if (i === currentStep) return 100;
    return 0;
  });

  return (
    <div className={`w-full px-4 py-2 flex flex-col gap-1.5 ${className}`}>
      {/* 4 horizontal progress segments */}
      <div className="flex items-center gap-2 w-full">
        {segmentFills.map((fillPercent, idx) => (
          <div
            key={idx}
            className="flex-1 h-1.5 rounded-full overflow-hidden bg-[rgba(44,24,16,0.08)] relative"
            role="progressbar"
            aria-valuenow={fillPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={labels[idx] || `Step ${idx + 1}`}
          >
            <div
              className="h-full bg-[var(--gold)] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        ))}
      </div>

      {/* Optional step labels */}
      {showLabels && (
        <div className="flex justify-between items-center px-0.5 text-xs font-mono font-medium text-[var(--mahogany-soft)]">
          {labels.map((label, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <span
                key={label}
                className={`
                  transition-colors duration-200
                  ${isActive ? 'text-[var(--mahogany)] font-bold' : ''}
                  ${isCompleted ? 'text-[var(--gold-dark)] font-semibold' : ''}
                  ${!isActive && !isCompleted ? 'opacity-40' : ''}
                `}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
