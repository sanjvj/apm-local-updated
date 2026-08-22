import { useState, type FC } from 'react';
import {
  Layout,
  Container,
  Hero,
  CategoryChips,
  SectionHeader,
  MenuItemCard,
  GhewarSpotlight,
  Footer,
  Toast,
  StickyCartBar,
} from '../components';
import { useMenu } from '../context/MenuContext';
import { CATEGORIES } from '../data/menuData';
import type { CategoryId } from '../types/menu';
import { Search, X, RotateCcw, Sparkles } from 'lucide-react';

export interface MenuScreenProps {
  onViewCart: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToTrack?: () => void;
}

export const MenuScreen: FC<MenuScreenProps> = ({
  onViewCart,
  onNavigateToAdmin,
  onNavigateToTrack,
}) => {
  const { menuItems } = useMenu();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Canonical spotlight item for Hero
  const spotlightItem = menuItems.find((i) => i.isSpotlight) || menuItems[0];

  // Additional signature items for Today's Special Spotlight section
  const signatureItems = menuItems.filter((i) => i.isSpotlight || i.category === 'ghewar').slice(0, 2);

  // Search & Category Filtering
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.meta && item.meta.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleResetFilter = () => {
    setActiveCategory('all');
    setSearchQuery('');
  };

  return (
    <Layout className="pb-24">
      {/* Hero Section */}
      {spotlightItem && (
        <Hero
          spotlightItem={spotlightItem}
          onNavigateToAdmin={onNavigateToAdmin}
          onNavigateToTrack={onNavigateToTrack}
        />
      )}

      <div className="py-8 sm:py-12 flex flex-col gap-10 sm:gap-12">
        {/* Today's Special Spotlight Section */}
        {signatureItems.length > 0 && (
          <Container className="flex flex-col gap-6">
            <SectionHeader
              title="Today's Special Spotlight"
              note="Signature authentic delicacies handcrafted fresh daily in Madurai"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {signatureItems.map((item) => (
                <GhewarSpotlight key={item.id} item={item} />
              ))}
            </div>
          </Container>
        )}

        {/* Main Menu Section */}
        <Container id="menu-section" className="flex flex-col gap-6 scroll-mt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
            <SectionHeader
              title="The Menu"
              note="Authentic traditional sweets & savouries"
            />

            {/* Search Input Bar */}
            <div className="relative w-full sm:w-72 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black/40">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sweets, savouries..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#EACFA5] text-xs font-sans text-[#2C1810] placeholder:text-black/40 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-black/40 hover:text-black transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <CategoryChips
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={(catId) => setActiveCategory(catId)}
          />

          {/* Product Grid or Empty Search State */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 min-[1440px]:grid-cols-5 gap-3.5 sm:gap-5">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="w-full py-16 px-4 rounded-2xl bg-[#F5EEE1]/60 border border-dashed border-[#EACFA5] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E5A93B]/20 flex items-center justify-center text-[#C8860A]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-[#2C1810]">
                No items found
              </h4>
              <p className="font-sans text-xs text-black/60 max-w-sm leading-relaxed">
                We couldn't find any sweets or savouries matching "{searchQuery}". Try searching for another delicacy or clear filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilter}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B1A1A] hover:bg-[#6B0F14] text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Delicacies</span>
              </button>
            </div>
          )}
        </Container>
      </div>

      {/* Footer */}
      <Footer
        onNavigateToMenu={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToTrack={onNavigateToTrack}
        onNavigateToAdmin={onNavigateToAdmin}
        onOpenStory={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
        onOpenReviews={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
        onOpenContact={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Sticky Cart & Toast */}
      <StickyCartBar onViewCart={onViewCart} />
      <Toast />
    </Layout>
  );
};
