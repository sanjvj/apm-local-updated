import type { SavedAddress } from '../types/address';

export const MADURAI_SERVICEABLE_PINCODES = [
  '625001',
  '625002',
  '625003',
  '625016',
  '625017',
  '625020',
];

export const INITIAL_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-home',
    tag: 'Home',
    fullName: 'Sanjay Kumar',
    fullAddress: '14 Bypass Road, Near TVS Nagar, Madurai',
    pincode: '625016',
    contactNumber: '+91 98765 43210',
    isDefault: true,
  },
  {
    id: 'addr-work',
    tag: 'Work',
    fullName: 'Anitha R',
    fullAddress: '42 West Masi Street, Opp. Meenakshi Temple, Madurai',
    pincode: '625001',
    contactNumber: '+91 98765 43211',
    isDefault: false,
  },
];
