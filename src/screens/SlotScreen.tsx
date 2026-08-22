import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Layout, Header, PageHeading, Container, SlotCard, Toast, isCutoffPassed } from '../components';
import { useCart } from '../context/CartContext';
import { useSlots } from '../context/SlotContext';
import { ArrowRight, Clock, Calendar, AlertCircle, Sparkles } from 'lucide-react';

export interface SlotScreenProps {
  onBackToCart: () => void;
  onBackToMenu: () => void;
  onProceedToAddress: () => void;
}

export const SlotScreen: FC<SlotScreenProps> = ({
  onBackToCart,
  onBackToMenu,
  onProceedToAddress,
}) => {
  const { selectedSlotId, setSelectedSlotId } = useCart();
  const { slots } = useSlots();

  // Check if all today's slots are cutoff or full
  const isTodayAllClosed = slots.every(
    (s) => isCutoffPassed(s.cutoffTime24h, s.cutoffLabel) || s.filled >= s.capacity
  );

  // Day tab selection state ('today' | 'tomorrow')
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>(() =>
    isTodayAllClosed ? 'tomorrow' : 'today'
  );

  // Auto-switch to tomorrow if today's slots all become closed
  useEffect(() => {
    if (isTodayAllClosed && selectedDay === 'today') {
      setSelectedDay('tomorrow');
    }
  }, [isTodayAllClosed, selectedDay]);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  // Date Formatting for Display
  const todayDateObj = new Date();
  const tomorrowDateObj = new Date(Date.now() + 86400000);

  const todayDateLabel = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const tomorrowDateLabel = tomorrowDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Layout className="pb-0">
      <div className="flex flex-col min-h-screen bg-[var(--ivory)] pb-28">
        {/* Header */}
        <Header
          onNavigateToMenu={onBackToMenu}
          onNavigateToCart={onBackToCart}
        />

        <div className="flex-1 py-6 sm:py-8 flex flex-col gap-6">
          <Container className="flex flex-col gap-6 max-w-4xl">
            {/* Page Heading and StepTrack */}
            <PageHeading
              title="Delivery Slot"
              onBack={onBackToCart}
              currentStep={2}
            />

            {/* Day Selector Tabs (Today vs Tomorrow) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[var(--line)] shadow-2xs">
              <div className="grid grid-cols-2 gap-2 w-full">
                {/* Today Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedDay('today')}
                  className={`
                    flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all cursor-pointer border
                    ${
                      selectedDay === 'today'
                        ? 'bg-[var(--crimson)] text-white border-[var(--crimson)] shadow-sm'
                        : 'bg-[var(--ivory-warm)]/40 text-[var(--mahogany-soft)] border-[var(--line)] hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm">
                    <Calendar className="w-4 h-4 stroke-[2]" />
                    <span>Today ({todayDateLabel})</span>
                  </div>
                  {isTodayAllClosed && (
                    <span className="font-mono text-[10px] bg-red-800/80 text-white px-2 py-0.5 rounded-full mt-1 font-bold">
                      All Slots Closed
                    </span>
                  )}
                </button>

                {/* Tomorrow Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedDay('tomorrow')}
                  className={`
                    flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all cursor-pointer border
                    ${
                      selectedDay === 'tomorrow'
                        ? 'bg-[var(--crimson)] text-white border-[var(--crimson)] shadow-sm'
                        : 'bg-[var(--ivory-warm)]/40 text-[var(--mahogany-soft)] border-[var(--line)] hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 stroke-[2] text-[var(--gold)]" />
                    <span>Tomorrow ({tomorrowDateLabel})</span>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full mt-1 font-bold">
                    Pre-orders Open
                  </span>
                </button>
              </div>
            </div>

            {/* Notification Banner when Today's Slots are Completed */}
            {isTodayAllClosed && selectedDay === 'tomorrow' && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-2xs flex items-center gap-3 animate-scale-in text-xs font-sans text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-amber-950 text-sm">
                    Today's Delivery Slots Closed
                  </span>
                  <span>
                    All of today's delivery windows have completed cutoffs or reached capacity. Showing <strong>tomorrow's ({tomorrowDateLabel})</strong> delivery slots!
                  </span>
                </div>
              </div>
            )}

            {/* Introductory Guidance Header */}
            <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--ivory-warm)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--gold-dark)]">
                  <Clock className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-display font-bold text-base sm:text-lg text-[var(--mahogany)]">
                    {selectedDay === 'tomorrow'
                      ? `Tomorrow's Batch Delivery (${tomorrowDateLabel})`
                      : `Today's Batch Delivery (${todayDateLabel})`}
                  </h3>
                  <p className="font-sans text-xs text-[var(--mahogany-soft)] opacity-90">
                    Select your preferred delivery window. Cutoffs apply for kitchen preparation.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Slot Grid Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  day={selectedDay}
                  isSelected={selectedSlotId === slot.id}
                  onSelect={(slotId) => setSelectedSlotId(slotId)}
                />
              ))}
            </div>

            {/* Selected Slot Summary Callout */}
            {selectedSlot && (
              <div className="bg-[var(--ivory-warm)] border border-[var(--gold)]/40 rounded-[var(--radius)] p-4 shadow-2xs flex items-center justify-between gap-4 animate-scale-in">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[var(--gold-dark)] animate-ping" />
                  <span className="font-sans font-bold text-sm text-[var(--mahogany)]">
                    Selected Window ({selectedDay === 'tomorrow' ? 'Tomorrow' : 'Today'}):{' '}
                    <span className="text-[var(--crimson)] font-mono">{selectedSlot.timeWindow}</span>
                  </span>
                </div>
                <span className="font-mono text-xs text-[var(--mahogany-soft)] bg-white px-2.5 py-1 rounded-full border border-[var(--line)]">
                  {selectedDay === 'tomorrow'
                    ? selectedSlot.cutoffLabel.replace('today', 'tomorrow')
                    : selectedSlot.cutoffLabel}
                </span>
              </div>
            )}
          </Container>
        </div>

        {/* Fixed Bottom Continuation CTA Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--mahogany)] text-[var(--ivory)] border-t border-white/10 p-4 shadow-[0_-6px_20px_rgba(44,24,16,0.35)] backdrop-blur-md">
          <Container className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-xs text-white/70 truncate">Selected Slot</span>
              <span className="font-display font-bold text-base sm:text-lg text-[var(--gold)] truncate">
                {selectedSlot ? `${selectedDay === 'tomorrow' ? 'Tomorrow ' : ''}${selectedSlot.timeWindow}` : 'None selected'}
              </span>
            </div>

            <button
              type="button"
              disabled={!selectedSlotId}
              onClick={() => {
                if (selectedSlotId && onProceedToAddress) {
                  onProceedToAddress();
                } else if (selectedSlotId) {
                  alert('Proceeding to Delivery Address Screen!');
                }
              }}
              className={`
                flex items-center gap-2 font-sans font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-150 shadow-md shrink-0 cursor-pointer border border-white/10
                ${
                  selectedSlotId
                    ? 'bg-[var(--gold)] text-[var(--mahogany)] hover:bg-[var(--gold-dark)] active:scale-95'
                    : 'bg-white/15 text-white/40 cursor-not-allowed'
                }
              `}
            >
              <span>Continue to Address</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </Container>
        </div>

        <Toast />
      </div>
    </Layout>
  );
};
