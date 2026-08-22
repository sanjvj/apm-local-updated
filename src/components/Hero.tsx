import type { FC } from 'react';
import { useState } from 'react';
import {
  ShieldAlert,
  Store,
  Plus,
  Check,
  ChevronRight,
  X,
  Search,
  Menu as MenuIcon,
  Star,
  MapPin,
  Phone,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Container } from './Container';
import { BrandLogo } from './BrandLogo';
import { useCart } from '../context/CartContext';
import type { MenuItem } from '../types/menu';

export interface HeroProps {
  spotlightItem?: MenuItem;
  onNavigateToAdmin?: () => void;
  onNavigateToTrack?: () => void;
  onScrollToMenu?: () => void;
  onOpenStory?: () => void;
  onOpenReviews?: () => void;
  onOpenContact?: () => void;
}

export const Hero: FC<HeroProps> = ({
  spotlightItem,
  onNavigateToAdmin,
  onNavigateToTrack,
  onScrollToMenu,
  onOpenStory,
  onOpenReviews,
  onOpenContact,
}) => {
  const { addToCart, cart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'collections' | 'story' | 'reviews' | 'contact'>('home');

  const featuredItem = spotlightItem || {
    id: 'malli-malai',
    name: 'Classic Malli Malai (Gajra)',
    price: 120,
    meta: 'Fresh Madurai Jasmine Garland',
    description: 'Freshly woven, fragrant Madurai Malli gajra.',
  };

  const itemQty = cart[featuredItem.id] || 0;

  const handleAddFeatured = () => {
    addToCart(featuredItem.id);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleNavClick = (nav: typeof activeNav) => {
    setActiveNav(nav);
    setShowMobileMenu(false);
    if (nav === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (nav === 'collections') {
      if (onScrollToMenu) onScrollToMenu();
      else document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (nav === 'story') {
      if (onOpenStory) onOpenStory();
      else setShowStoryModal(true);
    } else if (nav === 'reviews') {
      if (onOpenReviews) onOpenReviews();
      else setShowReviewsModal(true);
    } else if (nav === 'contact') {
      if (onOpenContact) onOpenContact();
      else setShowContactModal(true);
    } else {
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden text-[#FAF7F2] select-none" style={{ background: 'linear-gradient(135deg, #3A0A0E 0%, #5C1015 30%, #6B1520 50%, #4A0C12 80%, #2A0508 100%)' }}>
      {/* ── Background Layers ────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/hero_bg.jpg"
          alt="Madurai Heritage Silk Backdrop"
          className="w-full h-full object-cover object-center opacity-95"
        />
        {/* Soft subtle crimson gradient overlay — ensures high text contrast on left while preserving gopuram & right jasmine bowl */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(40,5,8,0.65) 0%, rgba(40,5,8,0.35) 45%, rgba(26,3,5,0.25) 100%)',
          }}
        />
        {/* Bottom fade to dark for trust bar zone */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(28,4,6,0.92) 0%, rgba(28,4,6,0.3) 18%, transparent 40%)',
          }}
        />
        {/* Top subtle darken for nav readability */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 15%)',
          }}
        />
      </div>

      {/* Decorative Jasmine Icon */}
      <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 pointer-events-none z-[1] opacity-70 hidden lg:block">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="3" fill="#D4AF37" />
          <ellipse cx="16" cy="8" rx="3.5" ry="5" fill="#C8A02E" opacity="0.8" />
          <ellipse cx="16" cy="24" rx="3.5" ry="5" fill="#C8A02E" opacity="0.8" />
          <ellipse cx="8" cy="16" rx="5" ry="3.5" fill="#B8901E" opacity="0.8" />
          <ellipse cx="24" cy="16" rx="5" ry="3.5" fill="#B8901E" opacity="0.8" />
        </svg>
      </div>

      {/* ── Main Content Container ────────────────────────────── */}
      <Container className="relative z-10 pt-4 sm:pt-5 pb-6 sm:pb-10 flex flex-col">
        {/* ═══ TOP NAVIGATION BAR ═══ */}
        <header className="flex items-center justify-between gap-3 pb-6 sm:pb-8">
          {/* Logo */}
          <div onClick={() => handleNavClick('home')} className="cursor-pointer shrink-0">
            <BrandLogo variant="full" badgeSize="md" theme="gold" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-sans font-medium">
            {(['home', 'collections', 'story', 'reviews', 'contact'] as const).map((nav) => (
              <button
                key={nav}
                type="button"
                onClick={() => handleNavClick(nav)}
                className={`relative py-1 transition-colors cursor-pointer capitalize ${
                  activeNav === nav ? 'text-white font-semibold' : 'text-white/75 hover:text-white'
                }`}
              >
                {nav === 'story' ? 'Our Story' : nav.charAt(0).toUpperCase() + nav.slice(1)}
                {activeNav === nav && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/90 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Header Actions & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {onNavigateToTrack && (
              <button
                type="button"
                onClick={onNavigateToTrack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/25 bg-white/[0.08] hover:bg-white/[0.15] text-[11px] font-sans font-medium text-white/90 transition-all cursor-pointer"
              >
                <Search className="w-3 h-3" />
                <span className="hidden sm:inline">Track Order</span>
              </button>
            )}
            {onNavigateToAdmin && (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E5A93B] hover:bg-[#C8860A] text-[#2C1810] font-sans font-bold text-[11px] transition-all cursor-pointer shadow-md"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Admin Panel</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowVendorModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/25 bg-white/[0.08] hover:bg-white/[0.15] text-[11px] font-sans font-medium text-white/90 transition-all cursor-pointer"
            >
              <Store className="w-3 h-3" />
              <span>Vendor</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* ═══ MOBILE MENU OVERLAY ═══ */}
        {showMobileMenu && (
          <div className="lg:hidden mb-6 p-4 rounded-2xl bg-[#240608]/95 border border-[#D4AF37]/30 backdrop-blur-md flex flex-col gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-display font-semibold text-sm text-[#E5A93B] uppercase tracking-wider">Navigation</span>
              <button
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="p-1 rounded-full text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans font-medium text-white">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-left cursor-pointer"
              >
                <span>🏠 Home</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('collections')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-left cursor-pointer"
              >
                <span>📜 Menu & Collections</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('story')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-left cursor-pointer"
              >
                <span>🛕 Our Story</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('reviews')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-left cursor-pointer"
              >
                <span>⭐ Reviews</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('contact')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-left cursor-pointer"
              >
                <span>📍 Contact & Kitchen</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowMobileMenu(false); setShowVendorModal(true); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-left cursor-pointer"
              >
                <span>🏬 Karigar & Vendor</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══ HERO CONTENT: Two Columns ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start lg:items-center">
          {/* LEFT COLUMN: Copy + Delivery Card */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-[#E5A93B]">
              TIMELESS CRAFT. &nbsp;&nbsp;•&nbsp;&nbsp; MADURAI SOUL.
            </span>

            <h1 className="font-display font-medium text-[34px] sm:text-[44px] lg:text-[50px] leading-[1.1] text-[#FAF7F2] tracking-tight">
              Handcrafted in Madurai.<br />
              Delivered only in{' '}
              <em className="not-italic font-normal italic text-[#E5A93B]">Madurai.</em>
            </h1>

            <div className="w-20 h-[2.5px] rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8901E] mt-0.5" />

            <p className="font-sans text-[13.5px] sm:text-[14.5px] text-white/75 leading-relaxed max-w-[440px] mt-1">
              Same-day order from our local artisans and karigars —<br className="hidden sm:block" />
              fresh, beautiful, and delivered to your doorstep.
            </p>

            {/* Delivery Highlight Card */}
            <div className="mt-3 bg-[#3A0A0F]/80 border border-[#D4AF37]/30 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 max-w-[400px]">
              <div className="w-12 h-12 rounded-full bg-[#4A1118] border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <circle cx="8" cy="24" r="3.5" stroke="#FFE5A3" strokeWidth="1.8" fill="none" />
                  <circle cx="24" cy="24" r="3.5" stroke="#FFE5A3" strokeWidth="1.8" fill="none" />
                  <circle cx="8" cy="24" r="1" fill="#FFE5A3" />
                  <circle cx="24" cy="24" r="1" fill="#FFE5A3" />
                  <path d="M8 24H18L21 16H25" stroke="#FFE5A3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 16L24 9H27" stroke="#FFE5A3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="7" y="11" width="8" height="7" rx="1.5" stroke="#FFE5A3" strokeWidth="1.8" fill="none" />
                  <path d="M11 11V18" stroke="#FFE5A3" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/65">
                  LOCAL ARTISANS &nbsp;•&nbsp; FAST DELIVERY
                </span>
                <span className="font-display text-[17px] sm:text-[19px] font-semibold text-white leading-tight">
                  Same-day delivery
                </span>
                <span className="font-sans text-[12px] font-semibold text-[#E5A93B]">
                  Only in Madurai
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Featured Product Card */}
          <div className="lg:col-span-5 flex items-start justify-center w-full">
            <div
              className="w-full max-w-[370px] rounded-[22px] p-5 sm:p-6 relative overflow-hidden flex flex-col min-h-[370px] sm:min-h-[400px] border border-white/15"
              style={{
                background: 'linear-gradient(170deg, #DCA42B 0%, #C4871C 40%, #A06810 70%, #784606 100%)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none rounded-[22px]"
                style={{
                  background: 'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(255,255,255,0.18) 0%, transparent 60%)',
                }}
              />

              <div className="flex items-center justify-between gap-2 relative z-10 mb-auto">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/15 border border-white/20 text-[9px] font-sans font-bold text-white uppercase tracking-wider">
                  <span className="text-[10px] leading-none">✦</span>
                  <span>HANDCRAFTED</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 text-[9px] font-sans font-semibold text-white/90 uppercase tracking-wider">
                  <svg width="8" height="10" viewBox="0 0 10 13" fill="none"><path d="M5 0C2.2 0 0 2.2 0 5C0 8.8 5 13 5 13C5 13 10 8.8 10 5C10 2.2 7.8 0 5 0ZM5 6.8C4 6.8 3.2 6 3.2 5C3.2 4 4 3.2 5 3.2C6 3.2 6.8 4 6.8 5C6.8 6 6 6.8 5 6.8Z" fill="white"/></svg>
                  <span>MADE IN MADURAI</span>
                </div>
              </div>

              <div className="py-8 flex items-center justify-center relative z-10">
                <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="88" fill="none" stroke="white" strokeWidth="1" strokeDasharray="5 5" opacity="0.4" />
                    <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeWidth="0.7" opacity="0.2" />
                  </svg>
                  <div
                    className="w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.15) 100%)',
                      border: '1.5px solid rgba(255,255,255,0.45)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <span className="font-display italic font-medium text-[34px] sm:text-[40px] text-white/85 tracking-wider">
                      AM
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3 relative z-10 mt-auto">
                <div className="flex flex-col">
                  <span className="font-display font-medium text-[17px] sm:text-[19px] text-white leading-snug">
                    {featuredItem.name}
                  </span>
                  <span className="font-sans font-bold text-[15px] sm:text-[17px] text-white mt-0.5">
                    ₹ {featuredItem.price}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddFeatured}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans font-bold text-[11px] sm:text-xs transition-all duration-200 shadow-md cursor-pointer shrink-0 ${
                    isAdded
                      ? 'bg-emerald-600 text-white scale-105'
                      : 'bg-[#F0A020] hover:bg-[#FFB73B] text-[#2C1810] hover:scale-105 active:scale-95'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>ADDED</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>ADD{itemQty > 0 ? ` (${itemQty})` : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TRUST HIGHLIGHTS BAR ═══ */}
        <div className="w-full mt-8 bg-[#1A0406]/80 border border-white/10 backdrop-blur-sm rounded-2xl py-4 px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { label: 'Handcrafted', sub: 'By local artisans', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4C13.5 2.5 16 2.5 17.5 4C19 5.5 19 8 17.5 9.5L12 15L6.5 9.5C5 8 5 5.5 6.5 4C8 2.5 10.5 2.5 12 4Z" stroke="white" strokeWidth="1.5"/><path d="M3 14H8L11 18H17C18.5 18 20 17 21 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )},
            { label: 'Same-day Delivery', sub: 'Fast & reliable', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="white" strokeWidth="1.5"/><path d="M12 9V13L15 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 2H14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )},
            { label: 'Only in Madurai', sub: 'Local orders only', icon: (
              <svg width="14" height="16" viewBox="0 0 14 18" fill="none"><path d="M7 0C3.1 0 0 3.1 0 7C0 12.3 7 18 7 18C7 18 14 12.3 14 7C14 3.1 10.9 0 7 0ZM7 9.5C5.6 9.5 4.5 8.4 4.5 7C4.5 5.6 5.6 4.5 7 4.5C8.4 4.5 9.5 5.6 9.5 7C9.5 8.4 8.4 9.5 7 9.5Z" stroke="white" strokeWidth="1.5" fill="none"/></svg>
            )},
            { label: 'Quality Assured', sub: '100% genuine', icon: (
              <svg width="15" height="16" viewBox="0 0 18 22" fill="none"><path d="M9 1L1 4V10C1 15.5 4.4 20.6 9 21.9C13.6 20.6 17 15.5 17 10V4L9 1Z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M6 10.5L8 12.5L12.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )},
          ].map(({ label, sub, icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-display font-semibold text-[13px] sm:text-sm text-white leading-tight">{label}</span>
                <span className="font-sans text-[10px] sm:text-[11px] text-white/60 truncate">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ SOCIAL PROOF BANNER ═══ */}
        <div
          onClick={() => handleNavClick('reviews')}
          className="w-full mt-4 bg-[#F7E1C3] text-[#2C1810] rounded-xl py-3 px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md border border-[#EACFA5] cursor-pointer hover:bg-[#F2D7B4] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="font-display text-xl text-[#8B1A1A] font-bold leading-none select-none">"</span>
            <span className="font-sans font-medium text-xs sm:text-[13px] text-[#3E2319]">
              Supporting local craft. Celebrating tradition.
            </span>
          </div>
          <div className="hidden md:block w-[1px] h-5 bg-[#2C1810]/15" />
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=56&h=56&fit=crop&crop=faces',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop&crop=faces',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=56&h=56&fit=crop&crop=faces',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=56&h=56&fit=crop&crop=faces',
              ].map((src, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#F7E1C3] overflow-hidden shadow-xs bg-[#522919]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="font-sans font-semibold text-xs sm:text-[13px] text-[#2C1810]">
              Loved by 1,200+ customers in Madurai
            </span>
          </div>
        </div>
      </Container>

      {/* ═══ VENDOR MODAL ═══ */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowVendorModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#E5A93B]/20 flex items-center justify-center text-[#C8860A]"><Store className="w-6 h-6" /></div>
              <div>
                <h3 className="font-display font-bold text-xl">Karigar & Vendor Portal</h3>
                <p className="text-xs text-black/60">Madurai Artisans & Craft Network</p>
              </div>
            </div>
            <p className="text-sm text-black/75 leading-relaxed mb-4">Partner with AM Madurai for verified local deliveries. Zero listing fees, same-day fleet, next-day settlement.</p>
            <div className="bg-[#F5EEE1] rounded-xl p-3.5 mb-5 flex flex-col gap-2 text-xs">
              {['Zero listing fees for verified local karigars','Guaranteed same-day hyperlocal delivery fleet','Next-day direct bank settlement'].map(t => (
                <div key={t} className="flex items-center gap-2 text-emerald-800 font-semibold"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>{t}</span></div>
              ))}
            </div>
            <button type="button" onClick={() => { setShowVendorModal(false); onNavigateToAdmin?.(); }} className="w-full py-3 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
              <span>Access Partner Console</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══ OUR STORY MODAL ═══ */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setShowStoryModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4"><BrandLogo variant="compact" badgeSize="sm" /></div>
            <h3 className="font-display font-bold text-2xl mb-2 text-[#8B1A1A]">Tradition. Handcrafted in Madurai.</h3>
            <p className="text-sm text-black/80 leading-relaxed mb-3">AM Madurai was founded to preserve and celebrate the timeless culinary artistry and floral traditions of the Temple City. From authentic ghee-dripping Ghewar and Tirunelveli Halwa to freshly woven Madurai Malli gajras, every order is prepared with utmost reverence to craft.</p>
            <p className="text-sm text-black/80 leading-relaxed mb-4">Our master karigars bring decades of heritage expertise, ensuring each sweet carries the rich aroma of pure ghee, cardamom, and authentic local ingredients.</p>
            <div className="bg-[#F5EEE1] rounded-xl p-4 mb-5 border border-[#E5A93B]/30 flex flex-col gap-2 text-xs text-[#2C1810]">
              <div className="font-display font-semibold text-sm text-[#8B1A1A]">Why We Only Deliver in Madurai</div>
              <p className="text-black/75">Traditional sweets & fresh jasmine garlands lose their peak soul when stored for multi-day transit. By focusing strictly on hyperlocal same-day delivery across Madurai, we guarantee you receive every delicacy at peak freshness.</p>
            </div>
            <button type="button" onClick={() => setShowStoryModal(false)} className="w-full py-3 rounded-xl bg-[#2C1810] hover:bg-[#4A2F22] text-[#FAF7F2] font-sans font-bold text-sm transition-all shadow-md cursor-pointer">Explore Menu Delicacies</button>
          </div>
        </div>
      )}

      {/* ═══ REVIEWS MODAL ═══ */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col gap-4">
            <button type="button" onClick={() => setShowReviewsModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-[#8B1A1A]">
              <Star className="w-5 h-5 fill-[#E5A93B] text-[#E5A93B]" />
              <h3 className="font-display font-bold text-2xl">Customer Testimonials</h3>
            </div>
            <div className="flex items-center gap-4 bg-[#F5EEE1] p-3.5 rounded-xl border border-[#E5A93B]/30">
              <div className="text-3xl font-display font-bold text-[#8B1A1A]">4.9</div>
              <div className="flex flex-col text-xs text-black/75">
                <div className="flex items-center gap-1 text-[#E5A93B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span>Based on 1,240+ verified local orders in Madurai</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {[
                { name: 'Anitha Ramanathan', loc: 'TVS Nagar, Madurai', text: 'The Ghewar and Malli Malai arrived within 2 hours! Fresh, fragrant jasmine and authentic ghee taste. Reminded me of traditional home sweets.', rating: 5 },
                { name: 'Sanjay Kumar', loc: 'West Masi St, Madurai', text: 'Sublime packaging and prompt delivery. Perfect for family functions and evening poojas. Highly recommended for authentic Madurai sweets.', rating: 5 },
                { name: 'Meenakshi Sundaram', loc: 'KK Nagar, Madurai', text: 'Best Jangiri and Karasev in town. Fast delivery and neat handling.', rating: 5 }
              ].map((rev, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-[#EACFA5] flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-[#2C1810]">{rev.name}</span>
                    <div className="flex text-[#E5A93B]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-black/50 font-sans">{rev.loc}</span>
                  <p className="text-black/75 italic leading-relaxed">"{rev.text}"</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setShowReviewsModal(false)} className="w-full py-2.5 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-sm transition-all shadow-md cursor-pointer">
              Close Reviews
            </button>
          </div>
        </div>
      )}

      {/* ═══ CONTACT MODAL ═══ */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF7F2] text-[#2C1810] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative flex flex-col gap-4">
            <button type="button" onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-[#8B1A1A]">
              <MapPin className="w-6 h-6 text-[#E5A93B]" />
              <h3 className="font-display font-bold text-2xl">Contact & Kitchen</h3>
            </div>
            <p className="text-xs text-black/70">Visit our flagship kitchen or reach out for bulk orders & event catering in Madurai.</p>
            <div className="flex flex-col gap-3 bg-[#F5EEE1] p-4 rounded-xl border border-[#E5A93B]/30 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#8B1A1A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Flagship Kitchen:</span>
                  <span>72, West Masi Street, Near Meenakshi Temple, Madurai - 625001</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8B1A1A] shrink-0" />
                <div>
                  <span className="font-bold block">Phone / WhatsApp Support:</span>
                  <a href="tel:+919876543210" className="text-[#8B1A1A] font-semibold hover:underline">+91 98765 43210</a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#8B1A1A] shrink-0" />
                <div>
                  <span className="font-bold block">Kitchen Timings:</span>
                  <span>8:00 AM – 9:00 PM IST (Daily)</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#8B1A1A] shrink-0" />
                <div>
                  <span className="font-bold block">Email Enquiries:</span>
                  <a href="mailto:support@ammadurai.in" className="text-[#8B1A1A] hover:underline">support@ammadurai.in</a>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setShowContactModal(false)} className="w-full py-2.5 rounded-xl bg-[#2C1810] hover:bg-[#4A2F22] text-[#FAF7F2] font-sans font-bold text-sm transition-all shadow-md cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
