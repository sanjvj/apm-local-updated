import type { FC } from 'react';
import type { SavedAddress } from '../types/address';
import { Home, Briefcase, MapPin, Phone, Pencil, Trash2, User } from 'lucide-react';

export interface AddressCardProps {
  address: SavedAddress;
  isSelected?: boolean;
  onSelect?: (address: SavedAddress) => void;
  onEdit?: (address: SavedAddress) => void;
  onDelete?: (addressId: string) => void;
  className?: string;
}

export const AddressCard: FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  className = '',
}) => {
  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'Home':
        return <Home className="w-4 h-4 text-[var(--crimson)] stroke-[2]" />;
      case 'Work':
        return <Briefcase className="w-4 h-4 text-[var(--gold-dark)] stroke-[2]" />;
      default:
        return <MapPin className="w-4 h-4 text-[var(--mahogany-soft)] stroke-[2]" />;
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect && onSelect(address)}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(address);
        }
      }}
      className={`
        w-full rounded-[var(--radius)] p-4 sm:p-5 flex flex-col gap-3 transition-all duration-200 select-none cursor-pointer group
        ${
          isSelected
            ? 'bg-gradient-to-r from-[var(--ivory-warm)]/70 to-white border-[1.5px] border-[var(--crimson)] shadow-sm ring-1 ring-[var(--crimson)]/30'
            : 'bg-white hover:bg-white/90 border-[1.5px] border-[var(--line)] shadow-2xs hover:shadow-xs'
        }
        ${className}
      `}
    >
      {/* Top Header Row: Icon, Tag & Radio Selector */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--ivory-warm)] border border-[var(--line)] flex items-center justify-center shrink-0 shadow-2xs">
            {getTagIcon(address.tag)}
          </div>
          <span className="font-sans font-bold text-sm text-[var(--mahogany)]">
            {address.tag}
          </span>
          {address.isDefault && (
            <span className="font-mono text-[10px] font-semibold text-[var(--gold-dark)] bg-[var(--ivory-warm)] px-2 py-0.5 rounded-full border border-[var(--gold)]/30">
              Default
            </span>
          )}
        </div>

        {/* Right Radio Indicator */}
        <div className="shrink-0 flex items-center justify-center">
          <div
            className={`
              w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center
              ${
                isSelected
                  ? 'border-[var(--crimson)] bg-white'
                  : 'border-[var(--line)] bg-transparent'
              }
            `}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--crimson)] animate-scale-in" />
            )}
          </div>
        </div>
      </div>

      {/* Address Details & Customer Full Name */}
      <div className="flex flex-col gap-1 min-w-0 pl-1">
        {address.fullName && (
          <div className="flex items-center gap-1.5 font-sans font-bold text-sm text-[var(--mahogany)]">
            <User className="w-3.5 h-3.5 text-[var(--crimson)] shrink-0" />
            <span>{address.fullName}</span>
          </div>
        )}

        <p className="font-sans text-xs sm:text-sm text-[var(--mahogany-soft)] leading-relaxed break-words mt-0.5">
          {address.fullAddress}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[var(--mahogany-soft)] opacity-80 mt-1">
          <span>Pincode: {address.pincode}</span>
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 stroke-[2]" />
            {address.contactNumber}
          </span>
        </div>
      </div>

      {/* Action Buttons: Edit & Delete */}
      <div className="flex items-center justify-end gap-3 border-t border-[var(--line)]/60 pt-2.5 mt-1">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(address);
            }}
            className="
              flex items-center gap-1 text-xs font-sans font-semibold text-[var(--mahogany-soft)]
              hover:text-[var(--crimson)] transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-[var(--mahogany)]/5
            "
          >
            <Pencil className="w-3.5 h-3.5 stroke-[2]" />
            <span>Edit</span>
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(address.id);
            }}
            className="
              flex items-center gap-1 text-xs font-sans font-semibold text-[var(--mahogany-soft)]
              hover:text-[var(--crimson)] transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-[var(--crimson)]/10
            "
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};
