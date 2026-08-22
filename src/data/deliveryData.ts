import type { DeliveryPartner } from '../types/delivery';
import type { OrderSnapshot } from '../types/order';
import { MENU_ITEMS } from './menuData';
import { MADURAI_SLOTS } from './slotData';

export const INITIAL_DELIVERY_PARTNERS: DeliveryPartner[] = [
  {
    id: 'partner-1',
    name: 'Muthu Kumar',
    phone: '+91 94431 12345',
    vehicleNo: 'TN 59 AB 1234',
    vehicleType: 'TVS Jupiter (Red)',
    status: 'on_delivery',
    activeOrdersCount: 10,
    rating: 4.9,
    avatar: 'M',
    currentArea: 'TVS Nagar / Bypass Road',
  },
  {
    id: 'partner-2',
    name: 'Ramesh Raja',
    phone: '+91 98421 67890',
    vehicleNo: 'TN 59 CD 5678',
    vehicleType: 'Honda Activa 6G (Black)',
    status: 'available',
    activeOrdersCount: 0,
    rating: 4.8,
    avatar: 'R',
    currentArea: 'West Masi Street / Temple Area',
  },
  {
    id: 'partner-3',
    name: 'Karthik S',
    phone: '+91 97890 23456',
    vehicleNo: 'TN 59 EF 9012',
    vehicleType: 'Hero Splendor (Blue)',
    status: 'on_delivery',
    activeOrdersCount: 0,
    rating: 4.95,
    avatar: 'K',
    currentArea: 'KK Nagar / Anna Nagar',
  },
  {
    id: 'partner-4',
    name: 'Senthil Nathan',
    phone: '+91 96554 34567',
    vehicleNo: 'TN 59 GH 3456',
    vehicleType: 'TVS Heavy Duty XL (Green)',
    status: 'available',
    activeOrdersCount: 0,
    rating: 4.75,
    avatar: 'S',
    currentArea: 'Madurai Junction / Periyar',
  },
  {
    id: 'partner-5',
    name: 'Saravanan M',
    phone: '+91 95001 45678',
    vehicleNo: 'TN 59 JK 7890',
    vehicleType: 'Honda Dio (Matte Grey)',
    status: 'available',
    activeOrdersCount: 0,
    rating: 4.85,
    avatar: 'S',
    currentArea: 'Bypass Road Kitchen Base',
  },
];

export const INITIAL_MOCK_ORDERS: OrderSnapshot[] = [
  {
    orderId: 'APM-LD-94812',
    items: [
      { item: MENU_ITEMS[0], quantity: 2 }, // Mini Saffron Jangiri
      { item: MENU_ITEMS[4], quantity: 1 }, // Special Karupatti Halwa
    ],
    subtotal: 580,
    deliveryFee: 0,
    total: 580,
    slot: MADURAI_SLOTS[2], // 4:00 PM – 6:00 PM
    address: {
      id: 'addr-demo-1',
      tag: 'Home',
      fullName: 'Sanjay Kumar',
      fullAddress: '14 Bypass Road, Near TVS Nagar, Madurai',
      pincode: '625016',
      contactNumber: '+91 98765 43210',
      lat: 9.9056,
      lng: 78.0984,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    status: 'confirmed',
    customerName: 'Sanjay Kumar',
    customerPhone: '+91 98765 43210',
    estimatedDeliveryTime: '5:15 PM today',
    adminNotes: 'Customer requested quick dispatch if possible.',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '4:10 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '4:12 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-88301',
    items: [
      { item: MENU_ITEMS[1], quantity: 1 }, // Madurai Special Milk Peda
      { item: MENU_ITEMS[8], quantity: 2 }, // Spl Kara Sev
    ],
    subtotal: 440,
    deliveryFee: 0,
    total: 440,
    slot: MADURAI_SLOTS[2], // 4:00 PM – 6:00 PM
    address: {
      id: 'addr-demo-2',
      tag: 'Work',
      fullName: 'Anitha R',
      fullAddress: '42 West Masi Street, Opp. Meenakshi Temple, Madurai',
      pincode: '625001',
      contactNumber: '+91 98765 43211',
      lat: 9.9195,
      lng: 78.1193,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'confirmed',
    customerName: 'Anitha R',
    customerPhone: '+91 98765 43211',
    estimatedDeliveryTime: '5:45 PM today',
    adminNotes: 'Pack halwa in eco box.',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '3:50 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '3:52 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-74190',
    items: [
      { item: MENU_ITEMS[2], quantity: 3 }, // Ghee Mysore Pak
    ],
    subtotal: 660,
    deliveryFee: 0,
    total: 660,
    slot: MADURAI_SLOTS[3], // 7:00 PM – 9:00 PM
    address: {
      id: 'addr-demo-3',
      tag: 'Home',
      fullName: 'Meenakshi Sundaram',
      fullAddress: '88 KK Nagar 8th East Street, Madurai',
      pincode: '625020',
      contactNumber: '+91 99400 11223',
      lat: 9.9324,
      lng: 78.1432,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: 'confirmed',
    customerName: 'Meenakshi Sundaram',
    customerPhone: '+91 99400 11223',
    estimatedDeliveryTime: '7:30 PM today',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '4:25 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '4:27 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-61204',
    items: [
      { item: MENU_ITEMS[3], quantity: 2 }, // Royal Dry Fruit Laddu
      { item: MENU_ITEMS[5], quantity: 1 }, // Mixture Special
    ],
    subtotal: 520,
    deliveryFee: 0,
    total: 520,
    slot: MADURAI_SLOTS[2], // 4:00 PM – 6:00 PM
    address: {
      id: 'addr-demo-4',
      tag: 'Home',
      fullName: 'Karthik Raja',
      fullAddress: '18 Anna Nagar 8th Main Road, Madurai',
      pincode: '625020',
      contactNumber: '+91 98401 55443',
      lat: 9.9271,
      lng: 78.1481,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'confirmed',
    customerName: 'Karthik Raja',
    customerPhone: '+91 98401 55443',
    estimatedDeliveryTime: '5:30 PM today',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '4:00 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '4:02 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-53981',
    items: [
      { item: MENU_ITEMS[6], quantity: 3 }, // Thenkuzhal Murukku
      { item: MENU_ITEMS[0], quantity: 1 }, // Mini Saffron Jangiri
    ],
    subtotal: 750,
    deliveryFee: 0,
    total: 750,
    slot: MADURAI_SLOTS[2], // 4:00 PM – 6:00 PM
    address: {
      id: 'addr-demo-5',
      tag: 'Work',
      fullName: 'Priya Dharshini',
      fullAddress: '55 Ellis Nagar Main Road, Madurai',
      pincode: '625016',
      contactNumber: '+91 97910 88776',
      lat: 9.9142,
      lng: 78.1065,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'confirmed',
    customerName: 'Priya Dharshini',
    customerPhone: '+91 97910 88776',
    estimatedDeliveryTime: '5:50 PM today',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '4:15 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '4:18 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-48219',
    items: [
      { item: MENU_ITEMS[7], quantity: 2 }, // Ribbon Pakoda
    ],
    subtotal: 390,
    deliveryFee: 0,
    total: 390,
    slot: MADURAI_SLOTS[2], // 4:00 PM – 6:00 PM
    address: {
      id: 'addr-demo-6',
      tag: 'Work',
      fullName: 'Venkatesh S',
      fullAddress: '127 Periyar Bus Stand Road, Madurai',
      pincode: '625001',
      contactNumber: '+91 96299 11002',
      lat: 9.9167,
      lng: 78.1123,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    status: 'confirmed',
    customerName: 'Venkatesh S',
    customerPhone: '+91 96299 11002',
    estimatedDeliveryTime: '5:20 PM today',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '3:45 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '3:47 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-39402',
    items: [
      { item: MENU_ITEMS[4], quantity: 2 }, // Special Karupatti Halwa
      { item: MENU_ITEMS[2], quantity: 2 }, // Ghee Mysore Pak
    ],
    subtotal: 840,
    deliveryFee: 0,
    total: 840,
    slot: MADURAI_SLOTS[3], // 7:00 PM – 9:00 PM
    address: {
      id: 'addr-demo-7',
      tag: 'Home',
      fullName: 'Lakshmi Narayanan',
      fullAddress: '34 South Veli Street, Madurai',
      pincode: '625001',
      contactNumber: '+91 95000 33221',
      lat: 9.9138,
      lng: 78.1210,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'confirmed',
    customerName: 'Lakshmi Narayanan',
    customerPhone: '+91 95000 33221',
    estimatedDeliveryTime: '7:45 PM today',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '4:20 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '4:22 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-27514',
    items: [
      { item: MENU_ITEMS[1], quantity: 2 }, // Milk Peda
      { item: MENU_ITEMS[8], quantity: 3 }, // Spl Kara Sev
    ],
    subtotal: 610,
    deliveryFee: 0,
    total: 610,
    slot: MADURAI_SLOTS[2], // 4:00 PM – 6:00 PM
    address: {
      id: 'addr-demo-8',
      tag: 'Home',
      fullName: 'Subramanian K',
      fullAddress: '80 Simmakkal Main Road, Madurai',
      pincode: '625001',
      contactNumber: '+91 94440 99887',
      lat: 9.9245,
      lng: 78.1235,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    status: 'confirmed',
    customerName: 'Subramanian K',
    customerPhone: '+91 94440 99887',
    estimatedDeliveryTime: '5:40 PM today',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '4:05 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '4:08 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-16839',
    items: [
      { item: MENU_ITEMS[0], quantity: 1 }, // Mini Saffron Jangiri
      { item: MENU_ITEMS[7], quantity: 2 }, // Ribbon Pakoda
    ],
    subtotal: 490,
    deliveryFee: 0,
    total: 490,
    slot: MADURAI_SLOTS[2], // 4:00 PM – 6:00 PM
    address: {
      id: 'addr-demo-9',
      tag: 'Work',
      fullName: 'Divya Bharathi',
      fullAddress: '22 Arappalayam Bus Stand Street, Madurai',
      pincode: '625016',
      contactNumber: '+91 93800 44556',
      lat: 9.9312,
      lng: 78.1012,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'confirmed',
    customerName: 'Divya Bharathi',
    customerPhone: '+91 93800 44556',
    estimatedDeliveryTime: '5:55 PM today',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '4:18 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '4:20 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
  {
    orderId: 'APM-LD-10492',
    items: [
      { item: MENU_ITEMS[3], quantity: 4 }, // Royal Dry Fruit Laddu
      { item: MENU_ITEMS[6], quantity: 2 }, // Thenkuzhal Murukku
    ],
    subtotal: 920,
    deliveryFee: 0,
    total: 920,
    slot: MADURAI_SLOTS[3], // 7:00 PM – 9:00 PM
    address: {
      id: 'addr-demo-10',
      tag: 'Home',
      fullName: 'Muthuramalingam T',
      fullAddress: '98 Villapuram Housing Board, Madurai',
      pincode: '625012',
      contactNumber: '+91 91760 22334',
      lat: 9.8984,
      lng: 78.1154,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'confirmed',
    customerName: 'Muthuramalingam T',
    customerPhone: '+91 91760 22334',
    estimatedDeliveryTime: '7:15 PM today',
    timeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '4:30 PM', completed: true },
      { status: 'confirmed', label: 'Confirmed by Kitchen', timestamp: '4:32 PM', completed: true },
      { status: 'preparing', label: 'Kitchen Preparing Delicacies', completed: false },
      { status: 'picked_up', label: 'Picked Up by Delivery Partner', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered to Doorstep', completed: false },
    ],
  },
];
