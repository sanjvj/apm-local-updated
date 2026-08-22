import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import type { DeliveryPartner } from '../types/delivery';
import { X, User, Phone, Truck, MapPin, Save, Plus } from 'lucide-react';

export interface RiderModalProps {
  rider?: DeliveryPartner | null;
  onSave: (riderData: any) => void;
  onClose: () => void;
}

export const RiderModal: FC<RiderModalProps> = ({ rider, onSave, onClose }) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('');
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [currentArea, setCurrentArea] = useState<string>('');
  const [status, setStatus] = useState<'available' | 'on_delivery' | 'offline'>('available');

  useEffect(() => {
    if (rider) {
      setName(rider.name);
      setPhone(rider.phone);
      setVehicleType(rider.vehicleType);
      setVehicleNo(rider.vehicleNo);
      setCurrentArea(rider.currentArea || '');
      setStatus(rider.status);
    } else {
      setName('');
      setPhone('+91 ');
      setVehicleType('Activa 6G');
      setVehicleNo('TN 59 ');
      setCurrentArea('Madurai Main Hub');
      setStatus('available');
    }
  }, [rider]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const initialLetter = name.trim().charAt(0).toUpperCase();

    if (rider) {
      onSave({
        ...rider,
        name: name.trim(),
        phone: phone.trim(),
        vehicleType: vehicleType.trim() || 'Bike',
        vehicleNo: vehicleNo.trim() || 'TN 59 XX 0000',
        currentArea: currentArea.trim() || 'Madurai Hub',
        status,
        avatar: initialLetter,
      });
    } else {
      onSave({
        name: name.trim(),
        phone: phone.trim(),
        vehicleType: vehicleType.trim() || 'Bike',
        vehicleNo: vehicleNo.trim() || 'TN 59 XX 0000',
        currentArea: currentArea.trim() || 'Madurai Hub',
        status,
        activeOrdersCount: 0,
        rating: 4.9,
        avatar: initialLetter,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 relative animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[var(--crimson)] flex items-center justify-center border border-red-200 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-display font-bold text-xl text-gray-900">
              {rider ? 'Edit Delivery Guy' : 'Add New Delivery Guy'}
            </h3>
            <p className="font-sans text-xs text-gray-500">
              {rider ? 'Update rider profile & vehicle details' : 'Register a new rider into Madurai fleet'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-gray-100 pt-3">
          {/* Rider Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono font-bold text-gray-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Muthu Kumar"
              className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-sans text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
            />
          </div>

          {/* Contact Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono font-bold text-gray-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-500" />
              <span>Phone Number</span>
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 94431 12345"
              className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
            />
          </div>

          {/* Vehicle Type & Reg Number */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono font-bold text-gray-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gray-500" />
                <span>Vehicle Model</span>
              </label>
              <input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="e.g. TVS Jupiter"
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-sans text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono font-bold text-gray-700">
                Vehicle No.
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. TN 59 AB 1234"
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-gray-900 uppercase focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
              />
            </div>
          </div>

          {/* Assigned Base Area */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono font-bold text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <span>Operating Area</span>
            </label>
            <input
              type="text"
              value={currentArea}
              onChange={(e) => setCurrentArea(e.target.value)}
              placeholder="e.g. TVS Nagar / Bypass Road"
              className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-sans text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
            />
          </div>

          {/* Duty Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono font-bold text-gray-700">
              Initial Duty Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:outline-none cursor-pointer"
            >
              <option value="available">Available</option>
              <option value="on_delivery">On Delivery</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-sans font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="
                px-5 py-2 rounded-xl bg-[var(--crimson)] text-white text-xs font-sans font-bold
                hover:bg-[var(--crimson-dark)] transition-all shadow-md flex items-center gap-1.5 cursor-pointer
              "
            >
              {rider ? <Save className="w-4 h-4 text-[var(--gold)]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
              <span>{rider ? 'Save Changes' : 'Add Rider'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
