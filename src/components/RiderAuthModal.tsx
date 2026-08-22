import type { FC } from 'react';
import { useState } from 'react';
import { Phone, User, Sparkles, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export interface GigRiderProfile {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNo: string;
  totalEarnings: number;
  completedClustersCount: number;
}

export interface RiderAuthModalProps {
  onLoginSuccess: (rider: GigRiderProfile) => void;
}

export const RiderAuthModal: FC<RiderAuthModalProps> = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('TVS Jupiter (Scooter)');
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (isSignup) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }

      const newRider: GigRiderProfile = {
        id: `gig-rider-${Date.now()}`,
        name: name.trim(),
        phone: cleanPhone,
        vehicleType,
        vehicleNo: vehicleNo.trim().toUpperCase() || 'TN 59 TEMP',
        totalEarnings: 0,
        completedClustersCount: 0,
      };

      // Save to registered riders in localStorage
      try {
        const saved = localStorage.getItem('apm_registered_gig_riders');
        const ridersList: GigRiderProfile[] = saved ? JSON.parse(saved) : [];
        ridersList.push(newRider);
        localStorage.setItem('apm_registered_gig_riders', JSON.stringify(ridersList));
        localStorage.setItem('apm_active_gig_rider', JSON.stringify(newRider));
      } catch {}

      onLoginSuccess(newRider);
    } else {
      // Login mode: Check existing riders
      try {
        const saved = localStorage.getItem('apm_registered_gig_riders');
        const ridersList: GigRiderProfile[] = saved ? JSON.parse(saved) : [];
        const found = ridersList.find((r) => r.phone.includes(cleanPhone) || cleanPhone.includes(r.phone));

        if (found) {
          localStorage.setItem('apm_active_gig_rider', JSON.stringify(found));
          onLoginSuccess(found);
          return;
        }
      } catch {}

      // Fallback auto-create for quick demo access
      const defaultRider: GigRiderProfile = {
        id: `gig-rider-${Date.now()}`,
        name: name.trim() || 'Annapoorna Delivery Rider',
        phone: cleanPhone,
        vehicleType: 'Honda Activa 6G',
        vehicleNo: 'TN 59 AB 9999',
        totalEarnings: 0,
        completedClustersCount: 0,
      };
      localStorage.setItem('apm_active_gig_rider', JSON.stringify(defaultRider));
      onLoginSuccess(defaultRider);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EACFA5] flex flex-col gap-6 animate-scale-in">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <BrandLogo variant="compact" theme="dark" badgeSize="lg" />
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs font-bold text-[var(--gold)] bg-[var(--mahogany)] px-3 py-1 rounded-full uppercase tracking-wider">
              RIDER GIG PORTAL
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl text-[#2C1810] mt-1">
            {isSignup ? 'Become a Delivery Partner' : 'Welcome Back, Rider'}
          </h2>
          <p className="text-xs font-sans text-gray-600">
            {isSignup
              ? 'Earn guaranteed ₹50 per order on continuous cluster routes.'
              : 'Enter your phone number to access your active routes & wallet.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => { setIsSignup(true); setErrorMsg(''); }}
            className={`py-2 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer ${
              isSignup ? 'bg-[var(--mahogany)] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            New Rider Signup
          </button>
          <button
            type="button"
            onClick={() => { setIsSignup(false); setErrorMsg(''); }}
            className={`py-2 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer ${
              !isSignup ? 'bg-[var(--mahogany)] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rider Login
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
          {isSignup && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-sans font-bold text-gray-700">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required={isSignup}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-sans font-bold text-gray-700">Mobile Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>
          </div>

          {isSignup && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-sans font-bold text-gray-700">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
                  >
                    <option value="TVS Jupiter">TVS Jupiter</option>
                    <option value="Honda Activa 6G">Honda Activa 6G</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Hero Splendor">Hero Splendor</option>
                    <option value="Bicycle / Foot">Bicycle / Foot</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-sans font-bold text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="TN 59 AB 1234"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
                  />
                </div>
              </div>
            </>
          )}

          {errorMsg && (
            <p className="text-xs font-sans text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
              {errorMsg}
            </p>
          )}

          {/* Earnings Highlight Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="text-xs font-sans font-bold text-amber-900">Guaranteed Pay Rate:</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#8B1A1A]">₹50 / order</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{isSignup ? 'Register & Enter Portal' : 'Login to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
