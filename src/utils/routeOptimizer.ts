import type { OrderSnapshot } from '../types/order';

export interface RouteCoordinates {
  lat: number;
  lng: number;
}

export interface OptimizedOrder extends OrderSnapshot {
  stopNumber: number;
  distanceFromPrevKm: number;
  cumulatedDistanceKm: number;
  estimatedTimeMin: number;
}

export interface RouteSummary {
  optimizedOrders: OptimizedOrder[];
  totalDistanceKm: number;
  totalTimeMin: number;
}

// Exact Annapoorna Mithai Kitchen Store Hub: Bypass Road, Madurai
export const STORE_HUB_LOCATION: RouteCoordinates = {
  lat: 9.919040779352486,
  lng: 78.09418736057084,
};

/**
 * Calculates straight-line geographic distance between two coordinates using Haversine formula
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Known Madurai Locality Coordinates Map for deterministic area resolution
 */
const LOCALITY_COORDS_MAP: Record<string, RouteCoordinates> = {
  'bypass road': { lat: 9.9056, lng: 78.0984 },
  'tvs nagar': { lat: 9.9056, lng: 78.0984 },
  'west masi': { lat: 9.9195, lng: 78.1193 },
  'meenakshi temple': { lat: 9.9195, lng: 78.1193 },
  'kk nagar': { lat: 9.9324, lng: 78.1432 },
  'anna nagar': { lat: 9.9271, lng: 78.1481 },
  'periyar': { lat: 9.9167, lng: 78.1123 },
};

/**
 * Extracts valid GPS coordinates for an order (or resolves locality keywords deterministically)
 */
export const getOrderCoordinates = (order: OrderSnapshot): RouteCoordinates => {
  if (order.address?.lat && order.address?.lng) {
    return { lat: order.address.lat, lng: order.address.lng };
  }

  const fullAddr = (order.address?.fullAddress || '').toLowerCase();
  for (const [key, coords] of Object.entries(LOCALITY_COORDS_MAP)) {
    if (fullAddr.includes(key)) {
      return coords;
    }
  }

  // Fallback to store hub if unknown
  return STORE_HUB_LOCATION;
};

/**
 * Nearest-Neighbor TSP Route Optimization Algorithm
 * Sequences orders starting from Kitchen Store Hub (9.91904, 78.09418) to minimize total travel distance
 */
export const optimizeDeliveryRoute = (
  orders: OrderSnapshot[],
  startLocation: RouteCoordinates = STORE_HUB_LOCATION
): RouteSummary => {
  if (orders.length === 0) {
    return { optimizedOrders: [], totalDistanceKm: 0, totalTimeMin: 0 };
  }

  const unvisited = [...orders];
  const optimizedOrders: OptimizedOrder[] = [];

  let currentLocation = startLocation;
  let totalDistanceKm = 0;
  let currentCumulatedDistance = 0;

  let stopCounter = 1;

  while (unvisited.length > 0) {
    let nearestIdx = -1;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const coords = getOrderCoordinates(unvisited[i]);
      const dist = calculateHaversineDistance(
        currentLocation.lat,
        currentLocation.lng,
        coords.lat,
        coords.lng
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    if (nearestIdx !== -1) {
      const nextOrder = unvisited.splice(nearestIdx, 1)[0];
      const nextCoords = getOrderCoordinates(nextOrder);

      currentCumulatedDistance += minDistance;
      totalDistanceKm += minDistance;

      // Estimate travel time: Average 25 km/h urban speed + 3 mins per stop
      const legTimeMin = Math.max(2, Math.round((minDistance / 25) * 60) + 3);

      optimizedOrders.push({
        ...nextOrder,
        stopNumber: stopCounter++,
        distanceFromPrevKm: Number(minDistance.toFixed(2)),
        cumulatedDistanceKm: Number(currentCumulatedDistance.toFixed(2)),
        estimatedTimeMin: legTimeMin,
      });

      currentLocation = nextCoords;
    }
  }

  // Total estimated time calculation (25 km/h urban speed + 3 min per stop)
  const totalTimeMin = Math.round((totalDistanceKm / 25) * 60) + orders.length * 3;

  return {
    optimizedOrders,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalTimeMin,
  };
};
