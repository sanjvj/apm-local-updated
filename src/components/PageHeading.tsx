import type { FC } from 'react';
import { StepTrack } from './StepTrack';
import { ArrowLeft } from 'lucide-react';

export interface PageHeadingProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  currentStep?: number;
  showStepTrack?: boolean;
  className?: string;
}

export const PageHeading: FC<PageHeadingProps> = ({
  title,
  onBack,
  backLabel = 'Back',
  currentStep = 0,
  showStepTrack = true,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-3 pb-2 ${className}`}>
      {/* Back text link */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="
            inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[var(--mahogany-soft)]
            hover:text-[var(--crimson)] transition-colors cursor-pointer w-fit focus:outline-none focus:underline
          "
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
          <span>{backLabel}</span>
        </button>
      )}

      {/* Large Page Title */}
      <h1 className="font-display font-bold text-[30px] sm:text-[36px] lg:text-[40px] text-[var(--mahogany)] tracking-tight leading-none">
        {title}
      </h1>

      {/* 4-Segment Step Track Progress */}
      {showStepTrack && (
        <div className="pt-1">
          <StepTrack currentStep={currentStep} showLabels={true} className="px-0" />
        </div>
      )}
    </div>
  );
};
