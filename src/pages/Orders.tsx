import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Trash2,
  RotateCcw,
  MapPin,
  Phone,
  ChevronDown,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCart,
  MAX_LINE_QUANTITY,
  QuantityLimitError,
} from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import CartBar from '@/components/CartBar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { imageForKey, storeForKey, unitForKey } from '@/data/catalog';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface OrderItem {
  product_id?: number;
  name: string;
  name_hi?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  order_number: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address?: string | null;
  phone_number?: string | null;
}

/** Stages an active order moves through, in order. */
const FLOW = ['pending', 'accepted', 'out_for_delivery', 'delivered'] as const;

const STATUS_META: Record<
  string,
  { icon: typeof Clock; en: string; hi: string; tone: string }
> = {
  pending: { icon: Clock, en: 'Placed', hi: 'दर्ज', tone: 'text-amber-600 bg-amber-500/12' },
  accepted: { icon: CheckCircle2, en: 'Accepted', hi: 'स्वीकृत', tone: 'text-sky-600 bg-sky-500/12' },
  out_for_delivery: { icon: Truck, en: 'On the way', hi: 'रास्ते में', tone: 'text-violet-600 bg-violet-500/12' },
  delivered: { icon: CheckCircle2, en: 'Delivered', hi: 'पहुँचा', tone: 'text-emerald-600 bg-emerald-500/12' },
  cancelled: { icon: XCircle, en: 'Cancelled', hi: 'रद्द', tone: 'text-rose-600 bg-rose-500/12' },
};

const Orders = () => {
  const { language, tx } = useLanguage();
  const { user } = useAuth();
  const { addQuantity } = useCart();
  const en = language === 'en';

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  /** Order id currently being re-added, for the button's spinner. */
  const [reordering, setReordering] = useState<string | null>(null);
  /** Synchronous twin of `reordering`; state updates land too late to gate clicks. */
  const reorderingRef = useRef(false);
  const [tab, setTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (!error && data) setOrders(data as unknown as Order[]);
      setIsLoading(false);
    };

    load();

    // A delivery partner moves the order through accepted -> out_for_delivery
    // -> delivered from their own device. Without this the customer would sit
    // on a stale "Placed" badge until they reloaded the page by hand.
    const channel = supabase
      .channel(`my-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const { activeOrders, pastOrders } = useMemo(
    () => ({
      activeOrders: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)),
      pastOrders: orders.filter((o) => ['delivered', 'cancelled'].includes(o.status)),
    }),
    [orders],
  );

  const cancelOrder = async (id: string) => {
    const snapshot = orders;
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)));
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
    if (error) {
      setOrders(snapshot);
      toast.error(tx('Could not cancel the order', 'ऑर्डर रद्द नहीं हो सका'));
      return;
    }
    toast.success(tx('Order cancelled', 'ऑर्डर रद्द कर दिया गया'));
    setTab('past');
  };

  /** Remove a finished order from the history entirely. */
  const deleteOrder = async (id: string) => {
    const snapshot = orders;
    setOrders((os) => os.filter((o) => o.id !== id));
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      setOrders(snapshot);
      toast.error(tx('Could not remove the order', 'ऑर्डर हटाया नहीं जा सका'));
      return;
    }
    toast.success(tx('Order removed', 'ऑर्डर हटा दिया गया'));
  };

  const reorder = async (order: Order) => {
    // Spamming the button used to fire one reorder per click, each still in
    // flight, multiplying the cart. The ref is checked and set synchronously so
    // a second click cannot slip through before React re-renders the disabled
    // state — `reordering` state alone would leave that gap open.
    if (reorderingRef.current) return;
    reorderingRef.current = true;
    setReordering(order.id);

    try {
      let added = 0;
      let capped = false;

      for (const it of order.items) {
        if (typeof it.product_id !== 'number') continue;
        const store = storeForKey(it.product_id);
        const productId = store === 'mart' ? it.product_id - 100_000 : it.product_id;
        const want = Math.min(it.quantity, MAX_LINE_QUANTITY);
        if (want < it.quantity) capped = true;

        try {
          // One call per line. The old loop awaited once per unit, so a
          // 100-unit line meant 100 sequential round trips — slow enough that
          // the user clicked again, which is how the duplicates appeared.
          await addQuantity(
            {
              store,
              productId,
              name: it.name,
              nameHi: it.name_hi ?? it.name,
              price: it.price,
              image: imageForKey(it.product_id, it.image) ?? '',
            },
            want,
          );
          added += 1;
        } catch (err) {
          // A line already at the ceiling is not a failure worth reporting as
          // one — the rest of the order should still go in.
          if (err instanceof QuantityLimitError) capped = true;
        }
      }

      if (added && capped) {
        toast.success(
          tx(
            'Added to cart. Some items were capped at {n}.',
            'कार्ट में जोड़ा गया। कुछ आइटम {n} तक सीमित रहे।',
          ).replace('{n}', String(MAX_LINE_QUANTITY)),
        );
      } else if (added) {
        toast.success(tx('Items added to cart', 'आइटम कार्ट में जोड़े गए'));
      } else {
        toast.error(tx('Could not re-add these items', 'ये आइटम दोबारा नहीं जुड़े'));
      }
    } finally {
      reorderingRef.current = false;
      setReordering(null);
    }
  };

  const shown = tab === 'active' ? activeOrders : pastOrders;

  const OrderCard = ({ order }: { order: Order }) => {
    const meta = STATUS_META[order.status] ?? STATUS_META.pending;
    const StatusIcon = meta.icon;
    const isOpen = expanded === order.id;
    const cancellable = order.status === 'pending' || order.status === 'accepted';
    const finished = order.status === 'delivered' || order.status === 'cancelled';
    const stageIndex = FLOW.indexOf(order.status as (typeof FLOW)[number]);

    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="min-w-0">
            <p className="font-semibold text-foreground">#{order.order_number}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleString(tx('en-IN', 'hi-IN'), {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
              meta.tone,
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {tx(meta.en, meta.hi)}
          </span>
        </div>

        {/* Progress — only while the order is live */}
        {!finished && (
          <div className="flex items-center gap-1 px-4 pt-4">
            {FLOW.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    'h-1.5 rounded-full transition-colors',
                    i <= stageIndex ? 'accent-solid' : 'bg-border',
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    i <= stageIndex ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {tx(STATUS_META[s].en, STATUS_META[s].hi)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Items */}
        <div className="space-y-3 p-4">
          {(isOpen ? order.items : order.items.slice(0, 2)).map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img
                src={imageForKey(item.product_id, item.image)}
                alt={tx(item.name, item.name_hi) ?? item.name}
                loading="lazy"
                className="h-12 w-12 flex-shrink-0 rounded-lg border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {tx(item.name, item.name_hi) ?? item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {unitForKey(item.product_id, tx) && (
                    <span className="mr-1.5">{unitForKey(item.product_id, tx)} ·</span>
                  )}
                  {tx('Qty', 'मात्रा')}: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          ))}

          {order.items.length > 2 && (
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              {isOpen
                ? tx('Show less', 'कम दिखाएं')
                : en
                  ? `+${order.items.length - 2} more items`
                  : `+${order.items.length - 2} और आइटम`}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
            </button>
          )}
        </div>

        {/* Delivery details */}
        {(order.delivery_address || order.phone_number) && (
          <div className="space-y-1 border-t border-border px-4 py-3 text-xs text-muted-foreground">
            {order.delivery_address && (
              <p className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                {order.delivery_address}
              </p>
            )}
            {order.phone_number && (
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {order.phone_number}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 p-4">
          <div>
            <p className="text-xs text-muted-foreground">{tx('Total', 'कुल')}</p>
            <p className="text-lg font-bold text-primary">
              ₹{order.total_amount.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => reorder(order)}
              disabled={reordering !== null}
              className="gap-1.5"
            >
              {reordering === order.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              {reordering === order.id
                ? tx('Adding…', 'जोड़ा जा रहा है…')
                : tx('Reorder', 'फिर से ऑर्डर')}
            </Button>

            {cancellable && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    {tx('Cancel', 'रद्द करें')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {tx('Cancel this order?', 'यह ऑर्डर रद्द करें?')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {tx('This cannot be undone. The order moves to your past orders.', 'यह वापस नहीं किया जा सकता। ऑर्डर पिछले ऑर्डर में चला जाएगा।')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tx('Keep order', 'रहने दें')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cancelOrder(order.id)}>
                      {tx('Yes, cancel', 'हां, रद्द करें')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {finished && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <Trash2 className="h-3.5 w-3.5" />
                    {tx('Remove', 'हटाएं')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {tx('Remove from history?', 'इतिहास से हटाएं?')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {tx('This order will be deleted permanently.', 'यह ऑर्डर स्थायी रूप से हटा दिया जाएगा।')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tx('Keep', 'रहने दें')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteOrder(order.id)}>
                      {tx('Remove', 'हटाएं')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    /* Opaque surface: the fixed scene behind the app makes long receipt-style
       lists hard to read, so the orders window sits on its own background. */
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="pt-5">
          <BackButton />
        </div>

        <header className="pb-6 pt-8">
          <h1 className="page-title text-foreground">
            {tx('My Orders', 'मेरे ऑर्डर')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {tx('Track, reorder and manage your orders', 'ट्रैक करें, दोबारा ऑर्डर करें और प्रबंधित करें')}
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
          {(['active', 'past'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
                tab === k
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {k === 'active'
                ? `${tx('Active', 'सक्रिय')} (${activeOrders.length})`
                : `${tx('Past', 'पिछले')} (${pastOrders.length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/25" />
            <p className="mb-1 font-semibold text-foreground">
              {tab === 'active'
                ? tx('No active orders', 'कोई सक्रिय ऑर्डर नहीं')
                : tx('No past orders', 'कोई पिछला ऑर्डर नहीं')}
            </p>
            <p className="mb-5 text-sm text-muted-foreground">
              {tx('Start shopping to see orders here', 'ऑर्डर देखने के लिए खरीदारी शुरू करें')}
            </p>
            <Button asChild>
              <Link to="/kisan-mart">
                <ShoppingBag className="h-4 w-4" />
                {tx('Start shopping', 'खरीदारी करें')}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pb-28">
            {shown.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>

      <CartBar />
    </div>
  );
};

export default Orders;
