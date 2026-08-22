export interface SavedAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  fullName: string;
  fullAddress: string;
  pincode: string;
  contactNumber: string;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
  mapUrl?: string;
  landmark?: string;
}
