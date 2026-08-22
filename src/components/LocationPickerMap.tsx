import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Loader2, CheckCircle2, Search, Check, AlertCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export interface LocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  fullAddress?: string;
  onLocationSelect: (lat: number, lng: number, mapUrl: string) => void;
}

export const LocationPickerMap: FC<LocationPickerMapProps> = ({
  initialLat = 9.9195,
  initialLng = 78.1193,
  fullAddress = '',
  onLocationSelect,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [selectedName, setSelectedName] = useState<string>('Selected Location Pin');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState<string>(fullAddress);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const buildGoogleMapsUrl = (targetLat: number, targetLng: number) => {
    return `https://www.google.com/maps?q=${targetLat},${targetLng}`;
  };

  const updateLocation = (newLat: number, newLng: number, name: string) => {
    const roundedLat = Number(newLat.toFixed(5));
    const roundedLng = Number(newLng.toFixed(5));
    setLat(roundedLat);
    setLng(roundedLng);
    setSelectedName(name);
    setIsConfirmed(false);

    const url = buildGoogleMapsUrl(roundedLat, roundedLng);
    onLocationSelect(roundedLat, roundedLng, url);
  };

  const nudgeLocation = (deltaLat: number, deltaLng: number) => {
    const newLat = Number((lat + deltaLat).toFixed(5));
    const newLng = Number((lng + deltaLng).toFixed(5));
    updateLocation(newLat, newLng, 'Fine-Tuned Pin');
  };

  // Sync address search query when fullAddress changes from parent form
  useEffect(() => {
    if (fullAddress && fullAddress !== addressSearchQuery) {
      setAddressSearchQuery(fullAddress);
    }
  }, [fullAddress]);

  // Fast GPS Engine with Promise.race and try-finally guarantee
  const handleUseCurrentGPS = async () => {
    setIsLocating(true);
    setGpsMessage(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('NOT_SUPPORTED');
      }

      const positionPromise = new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 }
        );
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 4000);
      });

      const pos = await Promise.race([positionPromise, timeoutPromise]);
      const uLat = pos.coords.latitude;
      const uLng = pos.coords.longitude;
      updateLocation(uLat, uLng, 'Live Device GPS');
      setGpsMessage({ type: 'success', text: `GPS position detected: ${uLat.toFixed(4)}, ${uLng.toFixed(4)}` });
      setTimeout(() => setGpsMessage(null), 5000);

    } catch (err: any) {
      console.warn('GPS location error or timeout:', err);
      if (err?.message === 'NOT_SUPPORTED') {
        setGpsMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      } else if (err?.code === 1) {
        setGpsMessage({ type: 'error', text: 'Location permission denied. Please search your place below.' });
      } else {
        setGpsMessage({ type: 'error', text: 'Could not fetch device GPS. Please search your location below.' });
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Search Address / Landmark via OpenStreetMap Geocoding
  const handleSearchExecute = async () => {
    const q = addressSearchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setGpsMessage(null);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const place = results[0];
          const foundLat = parseFloat(place.lat);
          const foundLng = parseFloat(place.lon);
          const shortName = place.display_name.split(',')[0] || q;
          updateLocation(foundLat, foundLng, `Searched: ${shortName}`);
          setGpsMessage({ type: 'success', text: `Located: ${place.display_name.slice(0, 45)}...` });
          setTimeout(() => setGpsMessage(null), 5000);
        } else {
          setGpsMessage({ type: 'error', text: `No results found for "${q}". Try searching town or city name.` });
        }
      } else {
        setGpsMessage({ type: 'error', text: 'Search service busy. Try again in a moment.' });
      }
    } catch (err) {
      console.warn('Geocode search error:', err);
      setGpsMessage({ type: 'error', text: 'Network error while searching map.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmPin = () => {
    setIsConfirmed(true);
    const url = buildGoogleMapsUrl(lat, lng);
    onLocationSelect(lat, lng, url);
    setTimeout(() => setIsConfirmed(false), 4000);
  };

  return (
    <div className="w-full bg-white border border-[#EACFA5] rounded-2xl p-3 sm:p-4 flex flex-col gap-3 shadow-xs">
      {/* Component Header */}
      <div className="flex items-center justify-between gap-1.5 border-b border-[#EACFA5]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#8B1A1A] shrink-0" />
          <h4 className="font-display font-bold text-sm text-[#2C1810]">
            Pinpoint Delivery Location on Map
          </h4>
        </div>
        <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold w-fit">
          Google Maps Live View
        </span>
      </div>

      {/* Address Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={addressSearchQuery}
            onChange={(e) => setAddressSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchExecute();
              }
            }}
            placeholder="Search street, locality or town..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-[#EACFA5] font-sans text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
          />
        </div>
        <button
          type="button"
          onClick={handleSearchExecute}
          disabled={isSearching || !addressSearchQuery.trim()}
          className="px-3.5 py-2.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1 shrink-0"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
        </button>
      </div>

      {/* GPS Action Bar */}
      <div className="flex items-center justify-between gap-2 bg-[#F5EEE1] p-2.5 rounded-xl border border-[#EACFA5]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Compass className="w-4 h-4 text-[#8B1A1A] shrink-0" />
          <span className="truncate font-sans font-bold text-xs text-[#2C1810]">{selectedName}</span>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentGPS}
          disabled={isLocating}
          className="px-3 py-1.5 rounded-lg bg-[#8B1A1A] hover:bg-[#6B0F14] text-[var(--gold)] font-sans font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 border border-[var(--gold)]/30"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--gold)]" />
              <span>Locating GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-[var(--gold)] animate-pulse" />
              <span>Use Current GPS</span>
            </>
          )}
        </button>
      </div>

      {/* Large Full-Width Google Maps Preview Container (Height: h-96 / 384px on mobile, h-[420px] on desktop) */}
      <div className="relative w-full h-96 sm:h-[420px] rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-gray-100 select-none">
        <iframe
          key={`${lat}-${lng}`}
          title="Google Maps Delivery Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
          className="w-full h-full border-0"
        />

        {/* Top Floating Coordinates Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="font-mono text-[11px] font-bold text-gray-900 bg-white/95 px-3 py-1.5 rounded-lg shadow-md border border-gray-200 pointer-events-auto">
            📍 Lat: {lat}, Lng: {lng}
          </span>
        </div>

        {/* Floating D-Pad Nudge Buttons for Fine-Tuning Location (~30 meters per tap) */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col items-center gap-1 bg-white/95 p-1.5 rounded-xl shadow-lg border border-gray-200 pointer-events-auto">
          <span className="text-[9px] font-sans font-bold text-gray-600 uppercase tracking-tighter">Fine-Tune</span>
          <button
            type="button"
            onClick={() => nudgeLocation(0.0003, 0)}
            title="Nudge North (~30m)"
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#8B1A1A] hover:text-white text-gray-700 transition-all cursor-pointer active:scale-90"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => nudgeLocation(0, -0.0003)}
              title="Nudge West (~30m)"
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#8B1A1A] hover:text-white text-gray-700 transition-all cursor-pointer active:scale-90"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => nudgeLocation(0, 0.0003)}
              title="Nudge East (~30m)"
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#8B1A1A] hover:text-white text-gray-700 transition-all cursor-pointer active:scale-90"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => nudgeLocation(-0.0003, 0)}
            title="Nudge South (~30m)"
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#8B1A1A] hover:text-white text-gray-700 transition-all cursor-pointer active:scale-90"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
        <a
          href={buildGoogleMapsUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-sans font-bold text-[#8B1A1A] bg-[#F5EEE1] hover:bg-[#EACFA5]/50 px-3.5 py-2.5 rounded-xl border border-[#EACFA5] flex items-center justify-center gap-1.5 transition-all text-center"
        >
          <span>Open in Google Maps 🗺️</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          onClick={handleConfirmPin}
          className={`
            px-4 py-2.5 rounded-xl font-sans font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 text-center
            ${
              isConfirmed
                ? 'bg-emerald-600 text-white'
                : 'bg-[#8B1A1A] text-white hover:bg-[#6B0F14]'
            }
          `}
        >
          {isConfirmed ? (
            <>
              <Check className="w-4 h-4" />
              <span>Pin Location Set!</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>Confirm Pin Location 📍</span>
            </>
          )}
        </button>
      </div>

      {/* Status Feedback Messages */}
      {gpsMessage && (
        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold animate-scale-in ${
          gpsMessage.type === 'success' ? 'text-emerald-800 bg-emerald-50 border border-emerald-300' : 'text-amber-800 bg-amber-50 border border-amber-300'
        }`}>
          {gpsMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
          <span>{gpsMessage.text}</span>
        </div>
      )}
    </div>
  );
};
