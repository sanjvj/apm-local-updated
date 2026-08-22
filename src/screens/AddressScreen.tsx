import type { FC } from 'react';
import { useState } from 'react';
import { Layout, Header, PageHeading, Container, AddressCard, NewAddressForm, EditAddressModal, SummaryCard, ConfirmDialog, Toast } from '../components';
import { useCart } from '../context/CartContext';
import type { SavedAddress } from '../types/address';
import { ArrowRight, MapPin } from 'lucide-react';

export interface AddressScreenProps {
  onBackToSlot: () => void;
  onBackToCart: () => void;
  onBackToMenu: () => void;
  onProceedToPayment: () => void;
}

export const AddressScreen: FC<AddressScreenProps> = ({
  onBackToSlot,
  onBackToCart,
  onBackToMenu,
  onProceedToPayment,
}) => {
  const { savedAddresses, selectedAddress, setSelectedAddress, addSavedAddress, updateSavedAddress, deleteSavedAddress } = useCart();

  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const addressToDelete = savedAddresses.find((a) => a.id === deletingAddressId);

  return (
    <Layout className="pb-0">
      <div className="flex flex-col min-h-screen bg-[var(--ivory)] pb-28 lg:pb-0">
        {/* Header */}
        <Header
          onNavigateToMenu={onBackToMenu}
          onNavigateToCart={onBackToCart}
        />

        <div className="flex-1 py-6 sm:py-8 flex flex-col gap-6">
          <Container className="flex flex-col gap-6 max-w-6xl">
            {/* Page Heading and StepTrack */}
            <PageHeading
              title="Delivery Address"
              onBack={onBackToSlot}
              currentStep={3}
            />

            {/* Desktop Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (65% width / 8 cols on desktop): Saved Addresses List & Add Form */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Saved Addresses Section */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-display font-bold text-xl text-[var(--mahogany)] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[var(--crimson)]" />
                    <span>Select Saved Address</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        isSelected={selectedAddress?.id === addr.id}
                        onSelect={(address) => setSelectedAddress(address)}
                        onEdit={(address) => setEditingAddress(address)}
                        onDelete={(addressId) => setDeletingAddressId(addressId)}
                      />
                    ))}
                  </div>
                </div>

                {/* Add New Address Form Section */}
                <div className="pt-2">
                  <NewAddressForm
                    onAddAddress={(newAddr) => {
                      addSavedAddress(newAddr);
                      setSelectedAddress(newAddr);
                    }}
                  />
                </div>

              </div>

              {/* Right Column (35% width / 4 cols on desktop): Sticky Summary & CTA */}
              <div className="lg:col-span-4 sticky top-24">
                <SummaryCard
                  showSlotRecap={true}
                  onChangeSlot={onBackToSlot}
                  selectedAddress={selectedAddress}
                  ctaText="Continue to Payment"
                  ctaDisabled={!selectedAddress}
                  onCtaClick={() => {
                    if (selectedAddress && onProceedToPayment) {
                      onProceedToPayment();
                    } else if (selectedAddress) {
                      alert('Proceeding to Payment Screen!');
                    }
                  }}
                />
              </div>

            </div>
          </Container>
        </div>

        {/* Mobile & Tablet Fixed Bottom CTA Bar (<1024px) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--mahogany)] text-[var(--ivory)] border-t border-white/10 p-4 shadow-[0_-6px_20px_rgba(44,24,16,0.35)] backdrop-blur-md">
          <Container className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <MapPin className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[10px] text-white/70 uppercase tracking-wider">Address</span>
                <span className="font-sans font-semibold text-xs sm:text-sm text-[var(--gold)] truncate">
                  {selectedAddress ? `${selectedAddress.fullName || selectedAddress.tag} · ${selectedAddress.fullAddress}` : 'Select an address'}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedAddress}
              onClick={() => {
                if (selectedAddress && onProceedToPayment) {
                  onProceedToPayment();
                } else if (selectedAddress) {
                  alert('Proceeding to Payment Screen!');
                }
              }}
              className={`
                flex items-center gap-2 font-sans font-bold text-sm px-5 py-3 rounded-xl transition-all duration-150 shadow-sm shrink-0 cursor-pointer border border-white/10
                ${
                  selectedAddress
                    ? 'bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)] active:scale-95'
                    : 'bg-white/15 text-white/40 cursor-not-allowed'
                }
              `}
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </Container>
        </div>

        {/* Modal for Editing an Address */}
        {editingAddress && (
          <EditAddressModal
            address={editingAddress}
            onSave={(updated) => {
              updateSavedAddress(updated);
              if (selectedAddress?.id === updated.id) {
                setSelectedAddress(updated);
              }
              setEditingAddress(null);
            }}
            onClose={() => setEditingAddress(null)}
          />
        )}

        {/* Dialog for Confirming Address Deletion */}
        <ConfirmDialog
          isOpen={deletingAddressId !== null}
          title="Delete Saved Address?"
          message={`Are you sure you want to delete the saved address "${addressToDelete?.tag || 'Address'}" (${addressToDelete?.fullAddress || ''})? This action cannot be undone.`}
          confirmLabel="Delete Address"
          cancelLabel="Cancel"
          onConfirm={() => {
            if (deletingAddressId) {
              deleteSavedAddress(deletingAddressId);
              setDeletingAddressId(null);
            }
          }}
          onCancel={() => setDeletingAddressId(null)}
        />

        <Toast />
      </div>
    </Layout>
  );
};
