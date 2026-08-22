import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';

export const Toast: FC = () => {
  const { toastMessage } = useCart();
  const [visible, setVisible] = useState<boolean>(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');

  useEffect(() => {
    if (toastMessage) {
      setCurrentMessage(toastMessage);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!visible || !currentMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none
        px-4 py-2.5 rounded-full bg-[var(--mahogany)] text-[var(--ivory)] text-xs font-sans font-semibold
        shadow-[var(--shadow-md)] border border-white/10 flex items-center gap-2
        animate-toast-slide transition-all duration-200 max-w-[90vw] truncate
      "
    >
      <style>{`
        @keyframes toastSlide {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-toast-slide {
          animation: toastSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-toast-slide {
            animation: none !important;
          }
        }
      `}</style>
      <div className="w-5 h-5 rounded-full bg-[var(--gold)] text-[var(--mahogany)] flex items-center justify-center shrink-0">
        <ShoppingBag className="w-3 h-3 stroke-[2.5]" />
      </div>
      <span className="truncate">{currentMessage}</span>
    </div>
  );
};
