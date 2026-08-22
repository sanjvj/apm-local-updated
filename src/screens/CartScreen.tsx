import type { FC } from 'react';
import { useEffect } from 'react';
import { Layout, Header, PageHeading, Container, Toast, SectionHeader, MenuItemCard } from '../components';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { ShoppingBag, ArrowRight, Plus, Minus, Truck } from 'lucide-react';

export interface CartScreenProps {
  onBackToMenu: () => void;
  onProceedToSlot?: () => void;
}

export const CartScreen: FC<CartScreenProps> = ({ onBackToMenu, onProceedToSlot }) => {
  const { cart, cartItemsList, totalItems, subtotal, addToCart, removeFromCart, updateQty } = useCart();
  const { menuItems } = useMenu();

  // Reset scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Business Logic: Delivery fee threshold ₹300
  const deliveryThreshold = 300;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const amountNeededForFreeDelivery = Math.max(0, deliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / deliveryThreshold) * 100);

  // Filter up to 8 recommended items that are NOT currently in the cart
  const recommendedItems = menuItems.filter((item) => !cart[item.id] || cart[item.id] === 0).slice(0, 8);

  return (
    <Layout className="pb-0">
      <div className="flex flex-col min-h-screen bg-[var(--ivory)]">
        {/* Shared Top Header Bar */}
        <Header
          onNavigateToMenu={onBackToMenu}
          onNavigateToCart={() => {}}
        />

        {/* Main Content Area */}
        <div className="flex-1 py-6 flex flex-col gap-8">
          <Container className="flex flex-col gap-6">
            {/* Page Heading Pattern */}
            <PageHeading
              title="Your Cart"
              backLabel="Back to Menu"
              onBack={onBackToMenu}
              currentStep={0}
            />

            {totalItems === 0 ? (
              /* EMPTY CART STATE */
              <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto gap-4">
                <div className="w-20 h-20 rounded-full bg-[var(--ivory-warm)] border border-[var(--line)] flex items-center justify-center text-[var(--mahogany-soft)] shadow-sm">
                  <ShoppingBag className="w-9 h-9 stroke-[1.8]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display font-bold text-2xl text-[var(--mahogany)]">
                    Your cart is empty
                  </h2>
                  <p className="font-sans text-sm text-[var(--mahogany-soft)] opacity-80 leading-relaxed">
                    Your cart is empty. Add something from the menu to begin exploring Madurai authentic delicacies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="mt-2 px-6 py-3 rounded-xl bg-[var(--crimson)] text-white font-sans font-bold text-sm shadow-md hover:bg-[var(--crimson-dark)] active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              /* NON-EMPTY CART LAYOUT: 1 column on Mobile/Tablet, 2 columns on Desktop (1024px+) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: Cart Items List */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  {/* Free Delivery Progress Banner */}
                  <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-4 shadow-2xs flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${isFreeDelivery ? 'text-[var(--success)]' : 'text-[var(--gold-dark)]'}`} />
                        <span className="font-semibold text-[var(--mahogany)]">
                          {isFreeDelivery ? (
                            <span className="text-[var(--success)] font-bold">🎉 You unlocked FREE Local Delivery!</span>
                          ) : (
                            <span>Add <strong className="font-mono text-[var(--crimson)] font-bold">₹{amountNeededForFreeDelivery}</strong> more for FREE delivery</span>
                          )}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[var(--mahogany-soft)]">
                        {isFreeDelivery ? '100%' : `₹${subtotal}/₹300`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[var(--mahogany)]/8 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${isFreeDelivery ? 'bg-[var(--success)]' : 'bg-[var(--gold)]'}`}
                        style={{ width: `${freeDeliveryProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Items List Container */}
                  <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-4 sm:p-5 shadow-2xs flex flex-col divide-y divide-[var(--line)]">
                    <div className="pb-3 flex items-center justify-between">
                      <h3 className="font-display font-bold text-xl text-[var(--mahogany)]">
                        Order Items ({totalItems})
                      </h3>
                      <button
                        type="button"
                        onClick={onBackToMenu}
                        className="text-xs font-sans text-[var(--crimson)] font-semibold hover:underline cursor-pointer"
                      >
                        + Add more items
                      </button>
                    </div>

                    {cartItemsList.map(({ item, quantity }) => (
                      <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                        {/* Square Image Thumbnail & Details */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Square Gradient Thumbnail with Border */}
                          <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-[var(--line)] aspect-square overflow-hidden shrink-0 flex items-center justify-center text-white relative shadow-2xs"
                            style={{
                              background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                            }}
                          >
                            <span className="relative z-10 uppercase font-serif text-xs sm:text-sm font-bold opacity-90 drop-shadow-xs">
                              {item.name.slice(0, 2)}
                            </span>
                          </div>

                          {/* Name, Meta line, and Remove Link */}
                          <div className="flex flex-col min-w-0">
                            <h4 className="font-sans font-semibold text-[16px] text-[var(--mahogany)] leading-snug truncate">
                              {item.name}
                            </h4>
                            <span className="font-sans text-xs text-[var(--mahogany-soft)] opacity-75 mt-0.5 truncate">
                              {item.meta}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, 0)}
                              className="text-xs font-sans text-[var(--mahogany-soft)] underline hover:text-[var(--crimson)] transition-colors cursor-pointer w-fit mt-1.5"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Right Area: Stepper & Line Total */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1.5 bg-[var(--ivory-warm)] border border-[var(--line)] rounded-full p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              aria-label="Decrease quantity"
                              className="w-6 h-6 rounded-full bg-white text-[var(--mahogany)] hover:bg-[var(--mahogany)] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <span className="font-mono font-bold text-xs text-[var(--mahogany)] px-1.5 min-w-[18px] text-center">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(item.id)}
                              aria-label="Increase quantity"
                              className="w-6 h-6 rounded-full bg-[var(--gold)] text-[var(--mahogany)] hover:bg-[var(--gold-dark)] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* Line Total Price */}
                          <span className="font-mono font-bold text-base sm:text-lg text-[var(--red-dark)]">
                            ₹{(item.price * quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT COLUMN: Order Summary Card (Sticky on Desktop 1024px+) */}
                <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
                  <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                    <h3 className="font-display font-bold text-xl text-[var(--mahogany)] border-b border-[var(--line)] pb-3">
                      Order Summary
                    </h3>

                    <div className="flex flex-col gap-2.5 text-sm">
                      {/* Subtotal Row */}
                      <div className="flex justify-between items-center text-[var(--mahogany-soft)]">
                        <span className="font-sans">Subtotal</span>
                        <span className="font-mono font-semibold text-[var(--mahogany)] text-base">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Italic Muted Note */}
                      <p className="font-sans italic text-xs text-[var(--mahogany-soft)] opacity-80 leading-tight">
                        Delivery fee is calculated once you choose your slot
                      </p>

                      {/* Divider */}
                      <div className="border-t border-dashed border-[var(--line)] my-1" />

                      {/* Total Row */}
                      <div className="flex justify-between items-baseline">
                        <span className="font-sans font-bold text-base text-[var(--mahogany)]">
                          Total
                        </span>
                        <span className="font-mono font-bold text-2xl text-[var(--red-dark)]">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Desktop Primary Continue Button */}
                    <div className="hidden lg:flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onProceedToSlot) {
                            onProceedToSlot();
                          } else {
                            alert('Proceeding to Delivery Slot Selection!');
                          }
                        }}
                        className="
                          w-full py-3.5 px-5 rounded-xl bg-[var(--crimson)] text-white font-sans font-bold text-sm
                          hover:bg-[var(--crimson-dark)] active:scale-[0.99] transition-all duration-150
                          shadow-md flex items-center justify-center gap-2 cursor-pointer
                        "
                      >
                        <span>Choose Delivery Slot</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      {/* Continue Shopping Link */}
                      <button
                        type="button"
                        onClick={onBackToMenu}
                        className="text-xs font-sans text-[var(--mahogany-soft)] underline hover:text-[var(--mahogany)] transition-colors cursor-pointer text-center w-full pt-1"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* YOU MIGHT ALSO LIKE RECOMMENDATIONS SECTION */}
            {recommendedItems.length > 0 && (
              <section className="w-full pt-6 border-t border-[var(--line)] flex flex-col gap-3">
                <SectionHeader title="You Might Also Like" note="Add delicacies to your order" />

                {/* Mobile & Tablet Layout (<1024px): Horizontal scroll-snap carousel */}
                <div className="lg:hidden w-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex gap-3 sm:gap-4 pb-2">
                  <style>{`
                    .no-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                    .no-scrollbar {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>
                  {recommendedItems.map((item) => (
                    <div
                      key={item.id}
                      className="w-[165px] min-w-[165px] sm:w-[210px] sm:min-w-[210px] snap-start flex-shrink-0"
                    >
                      <MenuItemCard item={item} />
                    </div>
                  ))}
                </div>

                {/* Desktop Layout (1024px+): Full-width 4-column grid */}
                <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4">
                  {recommendedItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </Container>
        </div>

        {/* Mobile & Tablet Fixed Bottom Continue Bar (<1024px) */}
        {totalItems > 0 && (
          <div className="lg:hidden sticky bottom-0 left-0 right-0 z-40 bg-[var(--mahogany)] text-[var(--ivory)] border-t border-white/10 p-4 shadow-[0_-6px_20px_rgba(44,24,16,0.25)]">
            <Container className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-white/70">Total</span>
                <span className="font-mono font-bold text-lg text-[var(--gold)]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onProceedToSlot) {
                    onProceedToSlot();
                  } else {
                    alert('Proceeding to Delivery Slot Selection!');
                  }
                }}
                className="
                  flex items-center gap-2 bg-[var(--gold)] text-[var(--mahogany)] font-sans font-bold text-sm
                  px-5 py-3 rounded-xl hover:bg-[var(--gold-dark)] active:scale-95 transition-all duration-150 shadow-sm cursor-pointer
                "
              >
                <span>Choose Delivery Slot</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </Container>
          </div>
        )}

        <Toast />
      </div>
    </Layout>
  );
};
