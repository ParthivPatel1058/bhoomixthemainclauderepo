import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  useCart,
  MAX_LINE_QUANTITY,
  QuantityLimitError,
  type StoreKey,
} from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  store: StoreKey;
  productId: number;
  name: string;
  nameHi: string;
  price: number;
  image: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Blinkit-style add control: shows "Add" until the item is in the cart, then
 * swaps to a minus / quantity / plus stepper. Dropping to zero returns it to
 * the Add state. Updates are optimistic via CartContext, so taps feel instant.
 */
export default function QuantityStepper({
  store,
  productId,
  name,
  nameHi,
  price,
  image,
  disabled,
  className,
}: QuantityStepperProps) {
  const { quantityOf, add, setQuantity } = useCart();
  const { tx } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const qty = quantityOf(store, productId);

  const requireAuth = () => {
    if (user) return true;
    toast.error(tx('Please sign in to add items', 'आइटम जोड़ने के लिए साइन इन करें'), {
      action: {
        label: tx('Sign in', 'साइन इन'),
        onClick: () => navigate('/auth/login?next=' + encodeURIComponent(location.pathname)),
      },
    });
    return false;
  };

  const onAdd = async () => {
    if (!requireAuth() || busy) return;
    setBusy(true);
    try {
      await add({ store, productId, name, nameHi, price, image });
      toast.success(
        tx('{item} added to cart', '{item} कार्ट में जोड़ा गया').replace('{item}', tx(name, nameHi)),
      );
    } catch (err) {
      if (err instanceof QuantityLimitError) limitReached();
      else toast.error(tx('Could not add to cart', 'कार्ट में नहीं जोड़ा जा सका'));
    } finally {
      setBusy(false);
    }
  };

  const atLimit = qty >= MAX_LINE_QUANTITY;

  const limitReached = () =>
    toast.error(
      tx(
        'You can order at most {n} of one item',
        'एक आइटम के ज़्यादा से ज़्यादा {n} ही ऑर्डर कर सकते हैं',
      ).replace('{n}', String(MAX_LINE_QUANTITY)),
    );

  const step = async (delta: number) => {
    if (!requireAuth() || busy) return;
    if (delta > 0 && atLimit) {
      limitReached();
      return;
    }
    setBusy(true);
    try {
      await setQuantity(store, productId, delta);
    } catch (err) {
      if (err instanceof QuantityLimitError) limitReached();
      else toast.error(tx('Could not update cart', 'कार्ट अपडेट नहीं हो सका'));
    } finally {
      setBusy(false);
    }
  };

  if (disabled) {
    return (
      <div
        className={cn(
          'flex h-11 items-center justify-center rounded-xl border border-border bg-muted/40 text-sm font-semibold text-muted-foreground',
          className,
        )}
      >
        {tx('Out of stock', 'स्टॉक में नहीं')}
      </div>
    );
  }

  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        disabled={busy}
        className={cn(
          'flex h-11 items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold uppercase tracking-wide transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300',
          'border-[hsl(var(--aqua))] text-[hsl(var(--aqua-deep))] hover:bg-[hsl(var(--aqua)/0.12)] active:scale-[0.98]',
          'disabled:opacity-60',
          className,
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingBag strokeWidth={2.4} className="h-4 w-4" />
        )}
        {tx('Add', 'जोड़ें')}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex h-11 items-center justify-between rounded-xl accent-grad accent-ink shadow-sm',
        className,
      )}
    >
      <button
        onClick={() => step(-1)}
        disabled={busy}
        aria-label={tx('Decrease quantity', 'मात्रा घटाएं')}
        className="flex h-full w-11 items-center justify-center rounded-l-xl transition-colors hover:bg-black/10 active:bg-black/20 disabled:opacity-60"
      >
        <Minus strokeWidth={3} className="h-4 w-4" />
      </button>

      <span className="min-w-8 text-center text-base font-bold tabular-nums" aria-live="polite">
        {qty}
      </span>

      <button
        onClick={() => step(1)}
        disabled={busy || atLimit}
        aria-label={
          atLimit
            ? tx('Maximum quantity reached', 'अधिकतम मात्रा हो गई')
            : tx('Increase quantity', 'मात्रा बढ़ाएं')
        }
        title={
          atLimit
            ? tx('Limit is {n} per item', 'प्रति आइटम सीमा {n} है').replace(
                '{n}',
                String(MAX_LINE_QUANTITY),
              )
            : undefined
        }
        className="flex h-full w-11 items-center justify-center rounded-r-xl transition-colors hover:bg-black/10 active:bg-black/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus strokeWidth={3} className="h-4 w-4" />
      </button>
    </div>
  );
}
