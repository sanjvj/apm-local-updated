import type { FC } from 'react';
import { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle, ExternalLink, ArrowRight, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export interface PincodeInfo {
  pincode: string;
  locality: string;
  zoneId: string;
  zoneName: string;
  distKm: number;
}

export const MADURAI_PINCODES_DATA: Record<string, PincodeInfo> = {
  '625001': { pincode: '625001', locality: 'South Gate / Town Hall Road', zoneId: 'area-central', zoneName: 'Central Temple Zone', distKm: 3 },
  '625002': { pincode: '625002', locality: 'Tallakulam / Sellur', zoneId: 'area-north', zoneName: 'North Madurai', distKm: 4 },
  '625003': { pincode: '625003', locality: 'Madakulam / Anna Nagar West', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 3 },
  '625004': { pincode: '625004', locality: 'Bibikulam', zoneId: 'area-central', zoneName: 'Central Temple Zone', distKm: 2 },
  '625005': { pincode: '625005', locality: 'Race Course', zoneId: 'area-central', zoneName: 'Central Temple Zone', distKm: 3 },
  '625006': { pincode: '625006', locality: 'Thirunagar', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 6 },
  '625007': { pincode: '625007', locality: 'Vishwanathapuram', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 5 },
  '625008': { pincode: '625008', locality: 'Uthangudi', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 8 },
  '625009': { pincode: '625009', locality: 'Anuppanadi / K.K. Nagar / Ponmeni', zoneId: 'area-east', zoneName: 'East Madurai', distKm: 6 },
  '625010': { pincode: '625010', locality: 'Ellis Nagar / Anna Nagar', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 4 },
  '625011': { pincode: '625011', locality: 'Jaihindpuram', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 5 },
  '625012': { pincode: '625012', locality: 'Villapuram', zoneId: 'area-east', zoneName: 'East Madurai', distKm: 6 },
  '625014': { pincode: '625014', locality: 'Mattuthavani / Kochadai / Thiruparankundram', zoneId: 'area-east', zoneName: 'East Madurai', distKm: 7 },
  '625015': { pincode: '625015', locality: 'Pasumalai', zoneId: 'area-south', zoneName: 'South Madurai', distKm: 6 },
  '625016': { pincode: '625016', locality: 'S.S. Colony / Kalavasal (Outlet Base)', zoneId: 'area-central', zoneName: 'Central Temple Zone', distKm: 0 },
  '625017': { pincode: '625017', locality: 'Anna Nagar', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 5 },
  '625018': { pincode: '625018', locality: 'Thathaneri / Arappalayam', zoneId: 'area-north', zoneName: 'North Madurai', distKm: 4 },
  '625019': { pincode: '625019', locality: 'TVS Nagar', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 6 },
  '625020': { pincode: '625020', locality: 'K.K. Nagar / K. Pudur / Alagar Kovil Rd', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 6 },
  '625021': { pincode: '625021', locality: 'Sellur', zoneId: 'area-north', zoneName: 'North Madurai', distKm: 4 },
  '625022': { pincode: '625022', locality: 'Transport Nagar / Airport Road', zoneId: 'area-south', zoneName: 'South Madurai', distKm: 9 },
  '625023': { pincode: '625023', locality: 'Chinthamani / Palanganatham', zoneId: 'area-south', zoneName: 'South Madurai', distKm: 7 },
  '625104': { pincode: '625104', locality: 'Sholavandan Road (outskirts)', zoneId: 'area-north', zoneName: 'North Madurai', distKm: 12 },
  '625107': { pincode: '625107', locality: 'Vandiyur', zoneId: 'area-east', zoneName: 'East Madurai', distKm: 8 },
  '625531': { pincode: '625531', locality: 'Vadipatti (outskirts)', zoneId: 'area-west', zoneName: 'West Madurai (TVS Nagar)', distKm: 14 },
};

export interface PincodeCheckModalProps {
  onConfirmPincode: (info: PincodeInfo) => void;
  onClose?: () => void;
  canCloseWithoutSelect?: boolean;
}

export const PincodeCheckModal: FC<PincodeCheckModalProps> = ({
  onConfirmPincode,
  onClose,
  canCloseWithoutSelect = false,
}) => {
  const [pincodeInput, setPincodeInput] = useState<string>('');
  const [validatedInfo, setValidatedInfo] = useState<PincodeInfo | null>(null);
  const [isOutOfService, setIsOutOfService] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleVerifyPincode = (pin: string) => {
    setErrorMsg('');
    const cleanPin = pin.trim();

    if (!cleanPin || cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
      setErrorMsg('Please enter a valid 6-digit Madurai pincode.');
      setValidatedInfo(null);
      setIsOutOfService(false);
      return;
    }

    const matched = MADURAI_PINCODES_DATA[cleanPin];
    if (matched) {
      setValidatedInfo(matched);
      setIsOutOfService(false);
    } else {
      setValidatedInfo(null);
      setIsOutOfService(true);
    }
  };

  const handleSelectLocality = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPin = e.target.value;
    if (selectedPin && MADURAI_PINCODES_DATA[selectedPin]) {
      setPincodeInput(selectedPin);
      handleVerifyPincode(selectedPin);
    }
  };

  const handleConfirm = () => {
    if (validatedInfo) {
      localStorage.setItem('apm_user_pincode', JSON.stringify(validatedInfo));
      onConfirmPincode(validatedInfo);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] text-[#2C1810] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D4AF37]/40 relative flex flex-col gap-5">
        
        {/* Close Button if optional */}
        {canCloseWithoutSelect && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer text-black/50 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <BrandLogo variant="compact" theme="dark" badgeSize="md" />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-mono text-[10px] font-bold text-[#E5A93B] bg-[#2C1810] px-3 py-1 rounded-full uppercase tracking-wider">
              Hyperlocal Delivery Check
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl text-[#8B1A1A]">
            Check Delivery Availability
          </h2>
          <p className="text-xs font-sans text-black/70 leading-relaxed max-w-xs">
            We deliver handcrafted sweets & savouries same-day exclusively across Madurai. Enter your pin code to proceed.
          </p>
        </div>

        {/* Input & Locality Selector Form */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-sans font-bold text-[#2C1810] flex items-center justify-between">
              <span>Enter 6-Digit Pincode</span>
              <span className="text-[10px] text-[#8B1A1A] font-mono">e.g. 625001</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-[#8B1A1A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPincodeInput(val);
                    if (val.length === 6) handleVerifyPincode(val);
                  }}
                  placeholder="625001"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[#EACFA5] font-mono text-sm font-bold text-[#2C1810] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => handleVerifyPincode(pincodeInput)}
                className="px-4 py-2.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
              >
                Check
              </button>
            </div>
          </div>

          {/* Quick Locality Selector Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-sans font-semibold text-black/60">
              Or select your Madurai locality:
            </label>
            <select
              onChange={handleSelectLocality}
              defaultValue=""
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EACFA5] text-xs font-sans text-[#2C1810] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="" disabled>-- Select Madurai Locality --</option>
              {Object.values(MADURAI_PINCODES_DATA).map((item) => (
                <option key={`${item.pincode}-${item.locality}`} value={item.pincode}>
                  {item.locality} ({item.pincode}) • {item.zoneName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <p className="text-xs font-sans text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
            {errorMsg}
          </p>
        )}

        {/* Success Banner if Pincode matches Madurai */}
        {validatedInfo && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Same-Day Local Delivery Available! 🎉</span>
            </div>
            <p className="text-xs font-sans text-emerald-900 leading-snug">
              📍 <strong>{validatedInfo.locality}</strong> ({validatedInfo.pincode})
              <br />
              <span className="text-[11px] text-emerald-700 font-mono">
                Assigned Zone: {validatedInfo.zoneName} (~{validatedInfo.distKm} km from hub)
              </span>
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              className="mt-1 w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Menu & Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Out of Madurai Banner if Pincode is NOT in list */}
        {isOutOfService && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h4 className="font-display font-bold text-sm text-amber-950">
                  Currently Outside Same-Day Local Fleet Zone
                </h4>
                <p className="text-xs font-sans text-amber-900/90 leading-relaxed">
                  Our same-day express delivery fleet currently operates exclusively within <strong>Madurai city pin codes</strong>.
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 flex flex-col gap-2">
              <p className="text-xs font-sans text-black/80 leading-relaxed">
                Looking for nationwide or international delivery of our authentic Madurai delicacies? You can easily order online from our main portal:
              </p>
              <a
                href="https://annapoornamithai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Order Online at annapoornamithai.com</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#E5A93B]" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
