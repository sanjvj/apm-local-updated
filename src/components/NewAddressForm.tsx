import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { SavedAddress } from '../types/address';
import { MADURAI_SERVICEABLE_PINCODES } from '../data/addressData';
import { LocationPickerMap } from './LocationPickerMap';
import { CheckCircle2, AlertCircle, Plus, ChevronUp, MapPin } from 'lucide-react';

export interface NewAddressFormProps {
  onAddAddress: (address: SavedAddress) => void;
  className?: string;
}

export const NewAddressForm: FC<NewAddressFormProps> = ({ onAddAddress, className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Form State
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [fullName, setFullName] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [lat, setLat] = useState<number>(9.9195);
  const [lng, setLng] = useState<number>(78.1193);
  const [mapUrl, setMapUrl] = useState<string>('https://www.google.com/maps/dir/?api=1&destination=9.9195,78.1193');

  // Serviceability State
  const [pincodeChecked, setPincodeChecked] = useState<boolean>(false);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);

  const handlePincodeChange = (val: string) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 6);
    setPincode(numericVal);

    if (numericVal.length === 6) {
      setPincodeChecked(true);
      const ok = MADURAI_SERVICEABLE_PINCODES.includes(numericVal);
      setIsServiceable(ok);
    } else {
      setPincodeChecked(false);
      setIsServiceable(null);
    }
  };

  const isFormValid =
    fullName.trim().length >= 2 &&
    pincode.length === 6 &&
    isServiceable === true &&
    fullAddress.trim().length >= 5 &&
    contactNumber.trim().length >= 10;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const newAddress: SavedAddress = {
      id: `addr-${Date.now()}`,
      tag,
      fullName: fullName.trim(),
      fullAddress: fullAddress.trim(),
      pincode: pincode.trim(),
      contactNumber: contactNumber.trim().startsWith('+91')
        ? contactNumber.trim()
        : `+91 ${contactNumber.trim()}`,
      lat,
      lng,
      mapUrl,
      isDefault: false,
    };

    onAddAddress(newAddress);

    // Reset Form & Collapse
    setFullName('');
    setFullAddress('');
    setPincode('');
    setContactNumber('');
    setPincodeChecked(false);
    setIsServiceable(null);
    setIsOpen(false);
  };

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full p-4 rounded-[var(--radius)] bg-white border border-dashed border-[var(--crimson)]/50
          hover:border-[var(--crimson)] hover:bg-[var(--ivory-warm)]/30 text-[var(--crimson)]
          font-sans font-semibold text-sm transition-all duration-150 flex items-center justify-between
          cursor-pointer shadow-2xs group
        "
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--crimson)]/10 flex items-center justify-center text-[var(--crimson)] group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>Deliver to a new address</span>
        </div>
        <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${isOpen ? '' : 'rotate-180'}`} />
      </button>

      {/* Collapsible Form Container */}
      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 shadow-sm flex flex-col gap-4 animate-scale-in"
        >
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
            <MapPin className="w-4 h-4 text-[var(--crimson)]" />
            <h4 className="font-display font-bold text-lg text-[var(--mahogany)]">
              New Delivery Address
            </h4>
          </div>

          {/* Address Tag Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Address Type / Tag
            </label>
            <div className="flex items-center gap-2">
              {(['Home', 'Work', 'Other'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer
                    ${
                      tag === t
                        ? 'bg-[var(--crimson)] text-white font-bold shadow-2xs'
                        : 'bg-[var(--ivory-warm)] border border-[var(--line)] text-[var(--mahogany-soft)] hover:bg-[var(--mahogany)]/5'
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="address-fullname" className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Full Name <span className="text-[var(--crimson)]">*</span>
            </label>
            <input
              id="address-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sanjay Kumar"
              className="
                w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--ivory)]/40
                font-sans text-sm text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:bg-white
              "
              required
            />
          </div>

          {/* Pincode Field with Serviceability Check */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="address-pincode" className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Pincode <span className="text-[var(--crimson)]">*</span>
            </label>
            <input
              id="address-pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder="e.g. 625016"
              className="
                w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--ivory)]/40
                font-mono text-sm text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:bg-white
              "
              required
            />

            {/* Pincode Serviceability Status Message */}
            <div aria-live="polite" className="min-h-[20px] text-xs font-sans mt-0.5">
              {pincodeChecked && isServiceable === true && (
                <div className="flex items-center gap-1.5 text-[var(--success)] font-semibold">
                  <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                  <span>Serviceable — within Madurai delivery zone</span>
                </div>
              )}
              {pincodeChecked && isServiceable === false && (
                <div className="flex items-center gap-1.5 text-[var(--crimson)] font-semibold">
                  <AlertCircle className="w-4 h-4 stroke-[2]" />
                  <span>Not deliverable yet — we currently deliver within Madurai only</span>
                </div>
              )}
            </div>
          </div>

          {/* Full Address Textarea Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="address-full" className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Full Address <span className="text-[var(--crimson)]">*</span>
            </label>
            <textarea
              id="address-full"
              rows={3}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="House/flat no, street name, landmark (e.g. 14 Bypass Road, Near TVS Nagar)"
              className="
                w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--ivory)]/40
                font-sans text-sm text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:bg-white
                resize-none
              "
              required
            />
          </div>

          {/* Interactive Location Pinpoint Map */}
          <LocationPickerMap
            initialLat={lat}
            initialLng={lng}
            fullAddress={fullAddress}
            onLocationSelect={(newLat, newLng, newUrl) => {
              setLat(newLat);
              setLng(newLng);
              setMapUrl(newUrl);
            }}
          />

          {/* Contact Number Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="address-phone" className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Contact Phone Number <span className="text-[var(--crimson)]">*</span>
            </label>
            <input
              id="address-phone"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="
                w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--ivory)]/40
                font-mono text-sm text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:bg-white
              "
              required
            />
          </div>

          {/* Save & Use Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`
              w-full py-3 rounded-xl font-sans font-bold text-sm transition-all duration-150 shadow-sm mt-1 cursor-pointer
              ${
                isFormValid
                  ? 'bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)] active:scale-[0.99]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              }
            `}
          >
            Save & Use This Address
          </button>
        </form>
      )}
    </div>
  );
};
