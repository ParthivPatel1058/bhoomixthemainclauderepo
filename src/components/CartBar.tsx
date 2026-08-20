import { useState } from 'react';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CartDrawer from '@/components/CartDrawer';

/**
 * Sticky cart summary that rises from the bottom once the cart has anything
 * in it, mirroring the quick-commerce pattern. Tapping it opens the cart.
 */
export default function CartBar() {
  const { totalItems, totalPrice } = useCart();
  const { language, tx } = useLanguage();
  const [open, setOpen] = useState(false);
  const en = language === 'en';

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-500 ${
          totalItems > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-4 rounded-2xl accent-grad accent-ink px-5 py-3.5 shadow-[0_16px_40px_rgba(20,30,40,0.35)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <span className="relative">
              <ShoppingCart strokeWidth={2.2} className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-bold">
                {totalItems} {totalItems === 1 ? tx('item', 'आइटम') : tx('items', 'आइटम')}
              </span>
              <span className="block text-xs opacity-80">₹{totalPrice.toLocaleString('en-IN')}</span>
            </span>
          </span>

          <span className="flex items-center gap-1 text-sm font-bold uppercase tracking-wide">
            {tx('View cart', 'कार्ट देखें')}
            <ChevronRight strokeWidth={2.5} className="h-4 w-4" />
          </span>
        </button>
      </div>

      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
