import type { DeliverySlot } from '../types/slot';

export const MADURAI_SLOTS: DeliverySlot[] = [
  {
    id: 'slot-morning',
    timeWindow: '8:00 AM – 10:00 AM',
    cutoffLabel: 'Cutoff: 6:00 AM today',
    cutoffTime24h: '06:00',
    capacity: 18,
    filled: 12, // 6 spots left
  },
  {
    id: 'slot-noon',
    timeWindow: '11:30 AM – 1:30 PM',
    cutoffLabel: 'Cutoff: 9:30 AM today',
    cutoffTime24h: '09:30',
    capacity: 18,
    filled: 18, // Slot full
  },
  {
    id: 'slot-afternoon',
    timeWindow: '4:00 PM – 6:00 PM',
    cutoffLabel: 'Cutoff: 2:00 PM today',
    cutoffTime24h: '14:00',
    capacity: 18,
    filled: 14, // 4 spots left
  },
  {
    id: 'slot-evening',
    timeWindow: '7:00 PM – 9:00 PM',
    cutoffLabel: 'Cutoff: 11:59 PM today', // Flexible testing cutoff for evening batch
    cutoffTime24h: '23:59',
    capacity: 18,
    filled: 15, // 3 spots left
  },
];
