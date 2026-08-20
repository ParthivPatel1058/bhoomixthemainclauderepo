import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import PageHeader from '@/components/layout/PageHeader';
import { MapPin, Package, Phone, Navigation as NavIcon, CheckCircle, Truck, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';

/** Must stay in step with the customer-facing labels in pages/Orders.tsx. */
const STATUS_LABEL: Record<string, { en: string; hi: string }> = {
  pending: { en: '🔔 New', hi: '🔔 नया' },
  accepted: { en: '✅ Accepted', hi: '✅ स्वीकृत' },
  out_for_delivery: { en: '🚚 On the way', hi: '🚚 रास्ते में' },
  delivered: { en: '📦 Delivered', hi: '📦 पहुँचा' },
};

interface Order {
  id: string;
  order_number: string;
  items: any;
  total_amount: number;
  status: string;
  delivery_address: string | null;
  phone_number: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string;
}

const PartnerOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, tx } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  /** The RPC rejects non-partners; that needs a different empty state. */
  const [notPartner, setNotPartner] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
      
      // Subscribe to realtime order updates
      const channel = supabase
        .channel('partner-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          () => {
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      // Use secure RPC that hides customer PII for pending orders
      const { data, error } = await supabase
        .rpc('get_partner_orders');

      if (error) throw error;
      setOrders(data || []);
      setNotPartner(false);
    } catch (error) {
      // The RPC raises this for anyone who has not registered as a partner.
      // It is an expected state, not a failure — show them how to sign up.
      if ((error as { message?: string })?.message?.includes('not a registered partner')) {
        setNotPartner(true);
      } else if (import.meta.env.DEV) {
        console.error('Error loading orders:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'accepted',
          assigned_partner: user?.id
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(
        tx('Order accepted! Starting delivery...', 'ऑर्डर स्वीकार किया गया! डिलीवरी शुरू हो रही है...')
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error accepting order:', error);
      }
      toast.error(
        tx('Failed to accept order', 'ऑर्डर स्वीकार करने में विफल')
      );
    }
  };

  /**
   * Moves an order the partner already owns to its next stage. Without these
   * the flow dead-ended at `accepted` — nothing in the app ever wrote
   * `out_for_delivery` or `delivered`, so no order could be completed.
   */
  const advanceStatus = async (orderId: string, next: 'out_for_delivery' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: next })
        .eq('id', orderId);

      if (error) throw error;

      // A delivered order drops out of get_partner_orders, so refresh rather
      // than waiting on a realtime event for a row we can no longer read.
      await loadOrders();

      toast.success(
        next === 'out_for_delivery'
          ? tx('Marked as picked up', 'उठाया गया के रूप में चिह्नित')
          : tx('Order delivered 🎉', 'ऑर्डर डिलीवर हो गया 🎉')
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating order:', error);
      }
      toast.error(
        tx('Failed to update order', 'ऑर्डर अपडेट करने में विफल')
      );
    }
  };

  const handleNavigate = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">
              {tx('Loading orders...', 'ऑर्डर लोड हो रहे हैं...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <PageHeader
        eyebrow={tx('Partner', 'पार्टनर')}
        title={tx('🚚 Partner Deliveries', '🚚 पार्टनर डिलीवरी')}
      />
          <p className="text-muted-foreground">
            {tx('Accept and deliver orders in your area', 'अपने क्षेत्र में ऑर्डर स्वीकार करें और डिलीवर करें')}
          </p>
        </div>

        {notPartner ? (
          <Card className="p-12 text-center">
            <Package className="mx-auto mb-4 h-24 w-24 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold">
              {tx('You are not registered as a partner', 'आप पार्टनर के रूप में पंजीकृत नहीं हैं')}
            </h3>
            <p className="mb-6 text-muted-foreground">
              {tx(
                'Register as a delivery partner to start receiving orders.',
                'ऑर्डर पाने के लिए डिलीवरी पार्टनर के रूप में पंजीकरण करें।',
              )}
            </p>
            <Button onClick={() => navigate('/partner-registration')}>
              {tx('Register as a partner', 'पार्टनर के रूप में पंजीकरण करें')}
            </Button>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">
              {tx('No Orders Available', 'कोई ऑर्डर उपलब्ध नहीं')}
            </h3>
            <p className="text-muted-foreground">
              {tx('New orders will appear here automatically', 'नए ऑर्डर यहां स्वचालित रूप से दिखाई देंगे')}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 glass hover:shadow-lg transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">
                        {tx('Order', 'ऑर्डर')} #{order.order_number}
                      </h3>
                      <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                        {STATUS_LABEL[order.status]
                          ? tx(STATUS_LABEL[order.status].en, STATUS_LABEL[order.status].hi)
                          : order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString(
                        tx('en-IN', 'hi-IN'),
                        { dateStyle: 'medium', timeStyle: 'short' }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">₹{order.total_amount}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length} {tx('items', 'आइटम')}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 p-4 bg-secondary/20 rounded-lg">
                  <p className="font-semibold mb-2">
                    {tx('Order Items:', 'ऑर्डर आइटम:')}
                  </p>
                  <div className="space-y-1">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{tx(item.name, item.nameHi)}</span>
                        <span className="font-medium">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info - Only shown for accepted orders */}
                {order.status === 'pending' ? (
                  <div className="mb-4 p-3 bg-secondary/20 rounded-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {tx('🔒 Customer details will be revealed after accepting', '🔒 स्वीकार करने के बाद ग्राहक विवरण दिखाई देगा')}
                    </span>
                  </div>
                ) : (
                  <>
                    {order.delivery_address && (
                      <div className="mb-4 flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {tx('Delivery Address:', 'डिलीवरी पता:')}
                          </p>
                          <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                        </div>
                      </div>
                    )}

                    {order.phone_number && (
                      <div className="mb-4 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        <a href={`tel:${order.phone_number}`} className="text-primary hover:underline">
                          {order.phone_number}
                        </a>
                      </div>
                    )}

                    {/* GPS Location */}
                    {order.gps_lat && order.gps_lng && (
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary animate-pulse" />
                        <span className="text-sm font-medium">
                          {tx('📍 Live GPS Location Available', '📍 लाइव GPS लोकेशन उपलब्ध')}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {order.status === 'pending' && (
                    <Button
                      className="flex-1 gradient-primary"
                      onClick={() => handleAcceptOrder(order.id)}
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      {tx('Accept Order', 'ऑर्डर स्वीकार करें')}
                    </Button>
                  )}

                  {order.status === 'accepted' && (
                    <Button
                      className="flex-1 gradient-primary"
                      onClick={() => advanceStatus(order.id, 'out_for_delivery')}
                    >
                      <Truck className="mr-2 h-5 w-5" />
                      {tx('Picked up', 'सामान उठा लिया')}
                    </Button>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <Button
                      className="flex-1 gradient-primary"
                      onClick={() => advanceStatus(order.id, 'delivered')}
                    >
                      <PackageCheck className="mr-2 h-5 w-5" />
                      {tx('Mark delivered', 'डिलीवर हो गया')}
                    </Button>
                  )}

                  {order.gps_lat && order.gps_lng && (
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleNavigate(order.gps_lat!, order.gps_lng!)}
                    >
                      <NavIcon className="mr-2 h-5 w-5" />
                      {tx('Navigate', 'नेविगेट करें')}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerOrders;
