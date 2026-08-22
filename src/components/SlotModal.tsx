import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { DeliverySlot } from '../types/slot';
import { Clock, X, Save, AlertCircle } from 'lucide-react';

export interface SlotModalProps {
  slot?: DeliverySlot | null;
  onSave: (slotData: Omit<DeliverySlot, 'id' | 'filled'> | DeliverySlot) => void;
  onClose: () => void;
}

// Convert 24-hour time string ("08:00" or "14:30") to 12-hour AM/PM string ("8:00 AM" or "2:30 PM")
export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

export const SlotModal: FC<SlotModalProps> = ({ slot, onSave, onClose }) => {
  // Extract initial 24h times from slot if editing
  const [startTime, setStartTime] = useState<string>(() => {
    if (slot?.id === 'slot-morning') return '08:00';
    if (slot?.id === 'slot-noon') return '11:30';
    if (slot?.id === 'slot-afternoon') return '16:00';
    if (slot?.id === 'slot-evening') return '19:00';
    return '09:00';
  });

  const [endTime, setEndTime] = useState<string>(() => {
    if (slot?.id === 'slot-morning') return '10:00';
    if (slot?.id === 'slot-noon') return '13:30';
    if (slot?.id === 'slot-afternoon') return '18:00';
    if (slot?.id === 'slot-evening') return '21:00';
    return '11:00';
  });

  const [cutoffTime, setCutoffTime] = useState<string>(() => {
    if (slot?.cutoffTime24h) return slot.cutoffTime24h;
    if (slot?.id === 'slot-morning') return '06:00';
    if (slot?.id === 'slot-noon') return '09:30';
    if (slot?.id === 'slot-afternoon') return '14:00';
    if (slot?.id === 'slot-evening') return '17:00';
    return '07:00';
  });

  const [capacity, setCapacity] = useState<number>(slot?.capacity || 18);

  // Auto-calculated display fields
  const formattedWindow = `${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
  const formattedCutoffLabel = `Cutoff: ${formatTime12h(cutoffTime)} today`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !cutoffTime) return;

    if (slot) {
      onSave({
        ...slot,
        timeWindow: formattedWindow,
        cutoffLabel: formattedCutoffLabel,
        cutoffTime24h: cutoffTime,
        capacity: Number(capacity) || 18,
      });
    } else {
      onSave({
        timeWindow: formattedWindow,
        cutoffLabel: formattedCutoffLabel,
        cutoffTime24h: cutoffTime,
        capacity: Number(capacity) || 18,
      });
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-scale-in"
    >
      <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <Clock className="w-5 h-5 text-[var(--crimson)]" />
          <h3 className="font-display font-bold text-xl text-gray-900">
            {slot ? 'Edit Delivery Slot' : 'Add New Delivery Slot'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Time Picker Grid: Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="slot-start-time" className="text-xs font-mono font-bold text-gray-700">
                Slot Start Time <span className="text-[var(--crimson)]">*</span>
              </label>
              <input
                id="slot-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[var(--gold)] focus:outline-none cursor-pointer"
                required
              />
              <span className="text-[11px] font-sans text-gray-500">Display: {formatTime12h(startTime)}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="slot-end-time" className="text-xs font-mono font-bold text-gray-700">
                Slot End Time <span className="text-[var(--crimson)]">*</span>
              </label>
              <input
                id="slot-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[var(--gold)] focus:outline-none cursor-pointer"
                required
              />
              <span className="text-[11px] font-sans text-gray-500">Display: {formatTime12h(endTime)}</span>
            </div>
          </div>

          {/* Cutoff Time Picker & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="slot-cutoff-time" className="text-xs font-mono font-bold text-[var(--crimson)]">
                Cutoff Time (Order Deadline) <span className="text-[var(--crimson)]">*</span>
              </label>
              <input
                id="slot-cutoff-time"
                type="time"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[var(--crimson)]/40 text-sm font-mono font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[var(--gold)] focus:outline-none cursor-pointer"
                required
              />
              <span className="text-[11px] font-sans text-[var(--crimson)] font-semibold">
                Kitchen stops orders at: {formatTime12h(cutoffTime)}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="slot-capacity" className="text-xs font-mono font-bold text-gray-700">
                Max Daily Orders Capacity <span className="text-[var(--crimson)]">*</span>
              </label>
              <input
                id="slot-capacity"
                type="number"
                min={1}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 18)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
                required
              />
              <span className="text-[11px] font-sans text-gray-500">Total batch spots: {capacity}</span>
            </div>
          </div>

          {/* Realtime Live Preview Card */}
          <div className="bg-[var(--ivory-warm)]/60 border border-[var(--gold)]/40 rounded-xl p-3.5 flex flex-col gap-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--gold-dark)] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Live Storefront Preview
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-bold text-base text-[var(--mahogany)]">{formattedWindow}</span>
              <span className="font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">{formattedCutoffLabel}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-sans font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="
                px-5 py-2.5 rounded-xl bg-[var(--crimson)] text-white text-xs font-sans font-bold
                hover:bg-[var(--crimson-dark)] transition-all shadow-md flex items-center gap-1.5 cursor-pointer
              "
            >
              <Save className="w-4 h-4 text-[var(--gold)]" />
              <span>{slot ? 'Save Changes' : 'Create Slot'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
