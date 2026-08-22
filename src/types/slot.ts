export interface DeliverySlot {
  id: string;
  timeWindow: string;
  cutoffLabel: string;
  cutoffTime24h?: string; // e.g. "06:00", "09:30", "14:00", "17:00", "23:59"
  capacity: number;
  filled: number;
}
