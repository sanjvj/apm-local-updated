import type { FC } from 'react';
import { Trash2, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-scale-in"
    >
      <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-6 max-w-sm w-full shadow-xl flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-[var(--mahogany-soft)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--crimson)]/10 text-[var(--crimson)] flex items-center justify-center shrink-0 border border-[var(--crimson)]/20">
            <Trash2 className="w-5 h-5 stroke-[2]" />
          </div>
          <h3 className="font-display font-bold text-xl text-[var(--mahogany)] leading-snug">
            {title}
          </h3>
        </div>

        {/* Description Message */}
        <p className="font-sans text-xs sm:text-sm text-[var(--mahogany-soft)] leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--line)] mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="
              px-4 py-2.5 rounded-xl border border-[var(--line)] text-xs font-sans font-semibold
              text-[var(--mahogany-soft)] hover:bg-gray-50 transition-colors cursor-pointer
            "
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="
              px-4 py-2.5 rounded-xl bg-[var(--crimson)] text-white text-xs font-sans font-bold
              hover:bg-[var(--crimson-dark)] active:scale-95 transition-all shadow-sm cursor-pointer
            "
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
