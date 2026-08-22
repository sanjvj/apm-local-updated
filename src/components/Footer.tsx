import type { FC } from 'react';
import { useState } from 'react';
import { Container } from './Container';
import { BrandLogo } from './BrandLogo';
import { PolicyModal, type PolicyTab } from './PolicyModal';
import { MapPin, Phone, Clock, Heart, ShieldCheck, Truck, Lock, FileText, RefreshCw } from 'lucide-react';

export interface FooterProps {
  onNavigateToMenu?: () => void;
  onNavigateToTrack?: () => void;
  onNavigateToAdmin?: () => void;
  onOpenStory?: () => void;
  onOpenReviews?: () => void;
  onOpenContact?: () => void;
  onOpenPolicy?: (tab: PolicyTab) => void;
}

export const Footer: FC<FooterProps> = ({
  onNavigateToMenu,
  onNavigateToTrack,
  onNavigateToAdmin,
  onOpenStory,
  onOpenReviews,
  onOpenContact,
  onOpenPolicy,
}) => {
  const [activePolicyTab, setActivePolicyTab] = useState<PolicyTab | null>(null);

  const handlePolicyClick = (tab: PolicyTab) => {
    if (onOpenPolicy) {
      onOpenPolicy(tab);
    } else {
      setActivePolicyTab(tab);
    }
  };

  return (
    <footer className="w-full bg-[#1F080A] text-[#FAF7F2] border-t border-[#D4AF37]/20 pt-12 pb-8 relative overflow-hidden select-none">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#5C1015] via-transparent to-transparent" />

      <Container className="relative z-10 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 pb-8 border-b border-white/10">
          {/* Column 1: Brand & About */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div onClick={onNavigateToMenu} className="cursor-pointer">
              <BrandLogo variant="full" badgeSize="sm" theme="gold" />
            </div>
            <p className="font-sans text-xs text-white/70 leading-relaxed">
              Authentic traditional Madurai sweets and savouries, handcrafted fresh daily by local karigars using age-old recipes. Delivered same-day exclusively across Madurai.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-sans font-medium text-[#E5A93B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Authentic & Fresh Daily</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display font-semibold text-sm text-[#E5A93B] uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="flex flex-col gap-2 font-sans text-xs text-white/80">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToMenu) onNavigateToMenu();
                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left"
                >
                  Storefront Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenStory}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left"
                >
                  Our Heritage & Story
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenReviews}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left"
                >
                  Customer Reviews & Ratings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenContact) onOpenContact();
                    else handlePolicyClick('contact');
                  }}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left"
                >
                  Contact & Kitchen Location
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToTrack}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                >
                  <Truck className="w-3 h-3 text-[#E5A93B]" />
                  <span>Track Order Live</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Store Policies */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display font-semibold text-sm text-[#E5A93B] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#E5A93B]" />
              <span>Store Policies</span>
            </h4>
            <ul className="flex flex-col gap-2 font-sans text-xs text-white/80">
              <li>
                <button
                  type="button"
                  onClick={() => handlePolicyClick('terms')}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-white/40" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePolicyClick('privacy')}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-white/40" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePolicyClick('refund')}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3 text-white/40" />
                  <span>Refund & Cancellation</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePolicyClick('shipping')}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Truck className="w-3 h-3 text-white/40" />
                  <span>Shipping & Delivery</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePolicyClick('contact')}
                  className="hover:text-[#E5A93B] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 text-white/40" />
                  <span>Contact Us & Legal Info</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Madurai Kitchen & Timings */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display font-semibold text-sm text-[#E5A93B] uppercase tracking-wider">
              Madurai Kitchen
            </h4>
            <div className="flex flex-col gap-2.5 font-sans text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E5A93B] shrink-0 mt-0.5" />
                <span>72, West Masi Street, Near Meenakshi Temple, Madurai - 625001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E5A93B] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-[#E5A93B] transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#E5A93B] shrink-0" />
                <span>Open Daily: 8:00 AM – 9:00 PM IST</span>
              </div>
            </div>
          </div>

          {/* Column 5: Delivery Promise & Partner */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display font-semibold text-sm text-[#E5A93B] uppercase tracking-wider">
              Local Delivery
            </h4>
            <p className="font-sans text-xs text-white/75 leading-relaxed">
              Same-day hyperlocal delivery across all Madurai pincodes (625001 – 625020). Orders placed before 4:00 PM are delivered same evening.
            </p>
            <div className="pt-1 flex flex-col gap-2">
              <a
                href="/delivery"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-700 border border-emerald-500/40 text-xs font-sans font-semibold text-white transition-all cursor-pointer w-fit"
              >
                <Truck className="w-3.5 h-3.5 text-amber-300" />
                <span>Delivery Rider Portal (/delivery)</span>
              </a>
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-sans font-semibold text-white/90 transition-all cursor-pointer w-fit"
              >
                <span>Partner & Admin Console</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Direct Legal Policy Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-white/60">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span>© {new Date().getFullYear()} Annapoorna Mithai Local Delivery Pvt. Ltd.</span>
            <span className="hidden sm:inline">·</span>
            <button type="button" onClick={() => handlePolicyClick('terms')} className="hover:text-[#E5A93B] underline cursor-pointer">Terms</button>
            <span>·</span>
            <button type="button" onClick={() => handlePolicyClick('privacy')} className="hover:text-[#E5A93B] underline cursor-pointer">Privacy</button>
            <span>·</span>
            <button type="button" onClick={() => handlePolicyClick('refund')} className="hover:text-[#E5A93B] underline cursor-pointer">Refund Policy</button>
            <span>·</span>
            <button type="button" onClick={() => handlePolicyClick('shipping')} className="hover:text-[#E5A93B] underline cursor-pointer">Shipping Policy</button>
            <span>·</span>
            <button type="button" onClick={() => handlePolicyClick('contact')} className="hover:text-[#E5A93B] underline cursor-pointer">Contact Us</button>
          </div>

          <div className="flex items-center gap-1 text-[#E5A93B]">
            <span>Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 fill-[#E5A93B] text-[#E5A93B]" />
            <span>in Madurai, Tamil Nadu</span>
          </div>
        </div>
      </Container>

      {/* Render Policy Modal when active */}
      {activePolicyTab && (
        <PolicyModal
          initialTab={activePolicyTab}
          onClose={() => setActivePolicyTab(null)}
        />
      )}
    </footer>
  );
};
