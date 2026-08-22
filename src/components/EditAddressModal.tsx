import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { SavedAddress } from '../types/address';
import { MADURAI_SERVICEABLE_PINCODES } from '../data/addressData';
import { CheckCircle2, AlertCircle, X, Pencil } from 'lucide-react';

export interface EditAddressModalProps {
  address: SavedAddress;
  onSave: (updatedAddress: SavedAddress) => void;
  onClose: () => void;
}

export const EditAddressModal: FC<EditAddressModalProps> = ({ address, onSave, onClose }) => {
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>(address.tag);
  const [fullName, setFullName] = useState<string>(address.fullName || '');
  const [pincode, setPincode] = useState<string>(address.pincode);
  const [fullAddress, setFullAddress] = useState<string>(address.fullAddress);
  const [contactNumber, setContactNumber] = useState<string>(address.contactNumber);

  // Serviceability check
  const [pincodeChecked, setPincodeChecked] = useState<boolean>(true);
  const [isServiceable, setIsServiceable] = useState<boolean>(
    MADURAI_SERVICEABLE_PINCODES.includes(address.pincode)
  );

  const handlePincodeChange = (val: string) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 6);
    setPincode(numericVal);

    if (numericVal.length === 6) {
      setPincodeChecked(true);
      setIsServiceable(MADURAI_SERVICEABLE_PINCODES.includes(numericVal));
    } else {
      setPincodeChecked(false);
      setIsServiceable(false);
    }
  };

  const isFormValid =
    fullName.trim().length >= 2 &&
    pincode.length === 6 &&
    isServiceable &&
    fullAddress.trim().length >= 5 &&
    contactNumber.trim().length >= 10;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    onSave({
      ...address,
      tag,
      fullName: fullName.trim(),
      pincode: pincode.trim(),
      fullAddress: fullAddress.trim(),
      contactNumber: contactNumber.trim(),
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-address-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-scale-in"
    >
      <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-6 max-w-md w-full shadow-lg flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-[var(--mahogany-soft)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
          <Pencil className="w-4 h-4 text-[var(--crimson)]" />
          <h3 id="edit-address-title" className="font-display font-bold text-xl text-[var(--mahogany)]">
            Edit Address
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tag Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Address Tag
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

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-fullname" className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Full Name <span className="text-[var(--crimson)]">*</span>
            </label>
            <input
              id="edit-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] font-sans text-sm text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
              required
            />
          </div>

          {/* Pincode Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-pincode" className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Pincode <span className="text-[var(--crimson)]">*</span>
            </label>
            <input
              id="edit-pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] font-mono text-sm text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
              required
            />

            <div aria-live="polite" className="min-h-[18px] text-xs font-sans mt-0.5">
              {pincodeChecked && isServiceable && (
                <div className="flex items-center gap-1.5 text-[var(--success)] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Serviceable — within Madurai delivery zone</span>
                </div>
              )}
              {pincodeChecked && !isServiceable && (
                <div className="flex items-center gap-1.5 text-[var(--crimson)] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Not deliverable yet — we deliver within Madurai only</span>
                </div>
              )}
            </div>
          </div>

          {/* Full Address */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-address-full" className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Full Address <span className="text-[var(--crimson)]">*</span>
            </label>
            <textarea
              id="edit-address-full"
              rows={3}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] font-sans text-sm text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] resize-none"
              required
            />
          </div>

          {/* Contact Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-address-phone" className="font-sans font-semibold text-xs text-[var(--mahogany)]">
              Contact Phone Number <span className="text-[var(--crimson)]">*</span>
            </label>
            <input
              id="edit-address-phone"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--line)] font-mono text-sm text-[var(--mahogany)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
              required
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-sans font-semibold text-[var(--mahogany-soft)] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`
                px-5 py-2 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer shadow-sm
                ${
                  isFormValid
                    ? 'bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
