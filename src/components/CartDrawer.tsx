import { useState } from 'react';
import { Minus, Plus, Trash2, Loader2, PackageCheck, ShoppingCart, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import AddressPicker from '@/components/address/AddressPicker';
import { useAddresses, formatAddress } from '@/hooks/useAddresses';
import {
  useCart,
  STORE_OFFSET,
  MAX_LINE_QUANTITY,
  QuantityLimitError,
  type CartLine,
  type StoreKey,
} from '@/contexts/CartContext';
import { unitForKey, imageForKey } from '@/data/catalog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { trackPurchase } from '@/lib/analytics';

const DELIVERY_FEE = 25;
const FREE_DELIVERY_OVER = 500;

/**
 * Best-effort GPS fix for the delivery partner's navigation link.
 *
 * Resolves null rather than rejecting on every failure path — no geolocation
 * support, permission denied, or a device that never answers — so checkout is
 * never held up by more than the timeout below.
 */
async function captureLocation(): Promise<{ lat: number; lng: number } | null> {
  if (!('geolocation' in navigator)) return null;
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60_000,
      });
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Cart review and checkout. Quantities can be adjusted per line, and placing
 * an order writes to `orders` then clears the cart.
 */
export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { lines, totalItems, totalPrice, setQuantity, remove, clear } = useCart();
  const { language, tx } = useLanguage();

  /** Raising a line can hit the per-item ceiling, so it needs its own handler. */
  const bumpLine = async (l: CartLine) => {
    try {
      await setQuantity(storeOf(l.key), productIdOf(l.key), 1);
    } catch (err) {
      if (err instanceof QuantityLimitError) {
        toast.error(
          tx(
            'You can order at most {n} of one item',
            'एक आइटम के ज़्यादा से ज़्यादा {n} ही ऑर्डर कर सकते हैं',
          ).replace('{n}', String(MAX_LINE_QUANTITY)),
        );
      } else {
        toast.error(tx('Could not update cart', 'कार्ट अपडेट नहीं हो सका'));
      }
    }
  };
  const { user } = useAuth();
  const navigate = useNavigate();
  const en = language === 'en';

  const { addresses, defaultAddress } = useAddresses();
  const [placing, setPlacing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>(null);

  // Fall back to the default address until the user picks another.
  const selected = addresses.find((a) => a.id === chosenId) ?? defaultAddress;

  const delivery = totalPrice >= FREE_DELIVERY_OVER || totalPrice === 0 ? 0 : DELIVERY_FEE;
  const grand = totalPrice + delivery;

  /** Recover which store a line came from so the stepper stays in sync. */
  const storeOf = (key: number): StoreKey => (key >= STORE_OFFSET.mart ? 'mart' : 'agri');
  const productIdOf = (key: number) =>
    key >= STORE_OFFSET.mart ? key - STORE_OFFSET.mart : key;

  const placeOrder = async () => {
    if (!user || lines.length === 0) return;
    if (!selected) {
      toast.error(tx('Choose a delivery address first', 'पहले डिलीवरी पता चुनें'));
      setPickerOpen(true);
      return;
    }
    setPlacing(true);
    try {
      // Prefer the coordinates saved with the address; only ask the device when
      // the address was typed rather than pinned. A denied or slow permission
      // prompt must never block checkout.
      const coords =
        selected.lat != null && selected.lng != null
          ? { lat: Number(selected.lat), lng: Number(selected.lng) }
          : await captureLocation();

      const orderNumber = `BX${Date.now().toString().slice(-8)}`;
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        order_number: orderNumber,
        items: lines.map((l) => ({
          product_id: l.key,
          name: l.name,
          name_hi: l.nameHi,
          price: l.price,
          quantity: l.quantity,
          image: l.image,
        })),
        total_amount: grand,
        status: 'pending',
        // Snapshot the address text onto the order: editing or deleting the
        // saved address later must not rewrite where a past order went.
        delivery_address: formatAddress(selected),
        phone_number: selected.phone,
        address_id: selected.id,
        gps_lat: coords?.lat ?? null,
        gps_lng: coords?.lng ?? null,
      });
      if (error) throw error;

      trackPurchase({
        orderNumber,
        total: grand,
        items: lines.map((l) => ({ id: l.key, name: l.name, price: l.price, quantity: l.quantity })),
      });

      await clear();
      toast.success(
        tx('Order {id} placed!', 'ऑर्डर {id} दर्ज हो गया!').replace('{id}', orderNumber),
      );
      onOpenChange(false);
      navigate('/orders');
    } catch (e) {
      toast.error(tx('Could not place the order', 'ऑर्डर दर्ज नहीं हो सका'));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {tx('Your cart', 'आपका कार्ट')}
            {totalItems > 0 && (
              <span className="rounded-full accent-solid px-2 py-0.5 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">
              {tx('Your cart is empty', 'आपका कार्ट खाली है')}
            </p>
            <p className="text-sm text-muted-foreground">
              {tx('Add items from the market to get started.', 'शुरू करने के लिए बाज़ार से आइटम जोड़ें।')}
            </p>
          </div>
        ) : (
          <>
            {/* Lines */}
            <div data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto p-5">
              {lines.map((l) => (
                <div key={l.key} className="glass flex gap-3 rounded-2xl p-3">
                  <img
                    src={imageForKey(l.key, l.image)}
                    alt={tx(l.name, l.nameHi)}
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {tx(l.name, l.nameHi)}
                    </p>
                    <p className="flex items-baseline gap-1.5 text-sm">
                      <span className="font-bold text-primary">₹{l.price}</span>
                      {unitForKey(l.key, tx) && (
                        <span className="text-xs font-medium text-muted-foreground">
                          · {unitForKey(l.key, tx)}
                        </span>
                      )}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 rounded-lg border border-border">
                        <button
                          onClick={() => setQuantity(storeOf(l.key), productIdOf(l.key), -1)}
                          aria-label={tx('Decrease', 'घटाएं')}
                          className="flex h-8 w-8 items-center justify-center rounded-l-lg hover:bg-foreground/[0.06]"
                        >
                          <Minus strokeWidth={2.5} className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-bold tabular-nums">
                          {l.quantity}
                        </span>
                        <button
                          onClick={() => bumpLine(l)}
                          disabled={l.quantity >= MAX_LINE_QUANTITY}
                          aria-label={
                            l.quantity >= MAX_LINE_QUANTITY
                              ? tx('Maximum reached', 'अधिकतम हो गया')
                              : tx('Increase', 'बढ़ाएं')
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-r-lg hover:bg-foreground/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus strokeWidth={2.5} className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-foreground">
                        ₹{(l.price * l.quantity).toLocaleString('en-IN')}
                      </span>

                      <button
                        onClick={() => remove(l.key)}
                        aria-label={tx('Remove item', 'हटाएं')}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout */}
            <div className="space-y-3 border-t border-border p-5">
              {/* Deliver-to block */}
              {selected ? (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="flex w-full items-start gap-2.5 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/50"
                >
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {tx('Deliver to', 'यहाँ भेजें')} · {selected.label}
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {tx('Change', 'बदलें')}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {formatAddress(selected)}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {selected.receiver_name} · {selected.phone}
                    </span>
                  </span>
                </button>
              ) : (
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start gap-2.5 py-3"
                  onClick={() => setPickerOpen(true)}
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-left">
                    <span className="block text-sm font-semibold">
                      {tx('Add a delivery address', 'डिलीवरी पता जोड़ें')}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {tx('Required to place the order', 'ऑर्डर देने के लिए ज़रूरी')}
                    </span>
                  </span>
                </Button>
              )}

              <dl className="space-y-1 pt-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{tx('Items', 'आइटम')}</dt>
                  <dd className="font-medium">₹{totalPrice.toLocaleString('en-IN')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{tx('Delivery', 'डिलीवरी')}</dt>
                  <dd className="font-medium">
                    {delivery === 0 ? (
                      <span className="text-primary">{tx('FREE', 'मुफ़्त')}</span>
                    ) : (
                      `₹${delivery}`
                    )}
                  </dd>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {en
                      ? `Add ₹${FREE_DELIVERY_OVER - totalPrice} more for free delivery`
                      : `मुफ़्त डिलीवरी के लिए ₹${FREE_DELIVERY_OVER - totalPrice} और जोड़ें`}
                  </p>
                )}
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt className="font-bold">{tx('Total', 'कुल')}</dt>
                  <dd className="font-bold text-primary">₹{grand.toLocaleString('en-IN')}</dd>
                </div>
              </dl>

              <Button onClick={placeOrder} disabled={placing} className="h-12 w-full text-base">
                {placing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {tx('Placing order…', 'ऑर्डर हो रहा है…')}
                  </>
                ) : (
                  <>
                    <PackageCheck className="h-4 w-4" />
                    {tx('Place order', 'ऑर्डर करें')}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>

      <AddressPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedId={selected?.id ?? null}
        onSelect={(a) => setChosenId(a.id)}
      />
    </Sheet>
  );
}
