import type { FC, FormEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import type { MenuItem, CategoryId } from '../types/menu';
import { X, Upload, Image, Sparkles } from 'lucide-react';

export interface MenuItemModalProps {
  item?: MenuItem | null;
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}

export const MenuItemModal: FC<MenuItemModalProps> = ({ item, onSave, onClose }) => {
  const isEditing = !!item;

  const [name, setName] = useState<string>(item?.name || '');
  const [category, setCategory] = useState<Exclude<CategoryId, 'all'>>(item?.category || 'sweets');
  const [price, setPrice] = useState<number>(item?.price || 200);
  const [meta, setMeta] = useState<string>(item?.meta || '250g');
  const [description, setDescription] = useState<string>(item?.description || '');
  const [imageUrl, setImageUrl] = useState<string>(item?.imageUrl || '');
  const [gradientColor1, setGradientColor1] = useState<string>(item?.gradient[0] || '#C0202A');
  const [gradientColor2, setGradientColor2] = useState<string>(item?.gradient[1] || '#F0A020');
  const [stockBadge, setStockBadge] = useState<string>(item?.stockBadge || '');
  const [badgeType, setBadgeType] = useState<'gold' | 'crimson' | 'dark'>(item?.badgeType || 'gold');
  const [isSpotlight, setIsSpotlight] = useState<boolean>(item?.isSpotlight || false);
  const [isOutOfStock, setIsOutOfStock] = useState<boolean>(item?.isOutOfStock || false);

  // Handle local image file upload and convert to Base64 Data URL
  const handleImageFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    const savedItem: MenuItem = {
      id: item?.id || `menu-item-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price),
      meta: meta.trim() || '250g',
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      gradient: [gradientColor1, gradientColor2],
      stockBadge: stockBadge.trim() || undefined,
      badgeType,
      isSpotlight,
      isOutOfStock,
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-scale-in"
    >
      <div className="bg-white border border-[var(--line)] rounded-[var(--radius)] p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 relative my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <Sparkles className="w-5 h-5 text-[var(--crimson)]" />
          <h3 className="font-display font-bold text-xl text-gray-900">
            {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="item-name" className="text-xs font-mono font-bold text-gray-700">
                Item Name <span className="text-[var(--crimson)]">*</span>
              </label>
              <input
                id="item-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saffron Jangiri"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-sans focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="item-category" className="text-xs font-mono font-bold text-gray-700">
                Category <span className="text-[var(--crimson)]">*</span>
              </label>
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-sans focus:ring-2 focus:ring-[var(--gold)] focus:outline-none bg-white cursor-pointer font-semibold"
              >
                <option value="sweets">Sweets</option>
                <option value="savouries">Savouries</option>
                <option value="karupatti">Karupatti Special</option>
                <option value="gift-boxes">Gift Boxes</option>
                <option value="ghewar">Ghewar</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
          </div>

          {/* Price & Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="item-price" className="text-xs font-mono font-bold text-gray-700">
                Price (₹) <span className="text-[var(--crimson)]">*</span>
              </label>
              <input
                id="item-price"
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="item-meta" className="text-xs font-mono font-bold text-gray-700">
                Unit Weight / Pack Meta
              </label>
              <input
                id="item-meta"
                type="text"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder="e.g. 250g, 500g, 1kg box"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-sans focus:ring-2 focus:ring-[var(--gold)] focus:outline-none"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-1">
            <label htmlFor="item-description" className="text-xs font-mono font-bold text-gray-700">
              Item Description
            </label>
            <textarea
              id="item-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of ingredients or daily fresh preparation..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-sans focus:ring-2 focus:ring-[var(--gold)] focus:outline-none resize-none"
            />
          </div>

          {/* Image Upload / URL Input */}
          <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <label className="text-xs font-mono font-bold text-gray-800 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-[var(--crimson)]" />
              Item Image (Upload File OR Image URL)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* File Upload Button */}
              <label className="
                w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700
                text-xs font-sans font-bold hover:bg-gray-100 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0
              ">
                <Upload className="w-4 h-4 text-[var(--gold-dark)]" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-xs font-mono text-gray-400">or</span>

              {/* URL Input */}
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste Image URL (https://...)"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[var(--gold)] focus:outline-none bg-white"
              />
            </div>

            {/* Image Preview Box */}
            {imageUrl ? (
              <div className="flex items-center gap-3 mt-1">
                <div className="w-14 h-14 rounded-xl border border-gray-300 overflow-hidden shrink-0 shadow-2xs">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs font-sans text-red-600 hover:underline"
                >
                  Remove Image
                </button>
              </div>
            ) : null}
          </div>

          {/* Gradient Pickers (Fallback) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="gradient-1" className="text-[11px] font-mono text-gray-600">Gradient Start Color</label>
              <div className="flex items-center gap-2">
                <input
                  id="gradient-1"
                  type="color"
                  value={gradientColor1}
                  onChange={(e) => setGradientColor1(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                />
                <span className="font-mono text-xs text-gray-600">{gradientColor1}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="gradient-2" className="text-[11px] font-mono text-gray-600">Gradient End Color</label>
              <div className="flex items-center gap-2">
                <input
                  id="gradient-2"
                  type="color"
                  value={gradientColor2}
                  onChange={(e) => setGradientColor2(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                />
                <span className="font-mono text-xs text-gray-600">{gradientColor2}</span>
              </div>
            </div>
          </div>

          {/* Badge & Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="stock-badge" className="text-xs font-mono font-bold text-gray-700">Badge Label</label>
              <input
                id="stock-badge"
                type="text"
                value={stockBadge}
                onChange={(e) => setStockBadge(e.target.value)}
                placeholder="e.g. BESTSELLER, DAILY SPECIAL"
                className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="badge-type" className="text-xs font-mono font-bold text-gray-700">Badge Style</label>
              <select
                id="badge-type"
                value={badgeType}
                onChange={(e) => setBadgeType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-sans bg-white"
              >
                <option value="gold">Gold</option>
                <option value="crimson">Crimson</option>
                <option value="dark">Dark Mahogany</option>
              </select>
            </div>
          </div>

          {/* Checkbox Flags */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <label className="flex items-center gap-2 text-xs font-sans font-semibold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isSpotlight}
                onChange={(e) => setIsSpotlight(e.target.checked)}
                className="rounded text-[var(--crimson)] focus:ring-[var(--gold)]"
              />
              <span>Set as Hero Spotlight Item</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-sans font-semibold text-red-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isOutOfStock}
                onChange={(e) => setIsOutOfStock(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>Out of Stock</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-sans font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[var(--crimson)] text-white text-xs font-sans font-bold hover:bg-[var(--crimson-dark)] transition-all shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Add to Menu'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
