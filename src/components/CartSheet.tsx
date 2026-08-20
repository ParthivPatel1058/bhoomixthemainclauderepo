import { ShoppingBag, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: number;
  name: string;
  nameHi: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, change: number) => void;
  onRemoveItem: (id: number) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CartSheet = ({ open, onOpenChange, cartItems, onUpdateQuantity, onRemoveItem }: CartSheetProps) => {
  const { t, language, tx } = useLanguage();
  const { user } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error(tx('Please login to place order', 'ऑर्डर देने के लिए कृपया लॉगिन करें')
      );
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      // Capture GPS location
      let gpsLat: number | null = null;
      let gpsLng: number | null = null;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
          gpsLat = position.coords.latitude;
          gpsLng = position.coords.longitude;
        } catch (geoError) {
          console.log('GPS location not available:', geoError);
          // Continue without GPS - it's optional
        }
      }

      const orderNumber = `ORD${Date.now()}`;
      
      // Save order to database with GPS coordinates
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          items: cartItems as any,
          total_amount: total,
          status: 'pending',
          gps_lat: gpsLat,
          gps_lng: gpsLng
        });

      if (orderError) throw orderError;

      // Clear cart from database
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearError) throw clearError;
      
      toast.success(language === 'en' 
        ? `Order placed successfully! Order #${orderNumber}${gpsLat ? ' 📍 Live location tracked' : ''}` 
        : `ऑर्डर सफलतापूर्वक दिया गया! ऑर्डर #${orderNumber}${gpsLat ? ' 📍 लाइव लोकेशन ट्रैक किया गया' : ''}`
      );
      
      // Clear cart items in UI
      cartItems.forEach(item => onRemoveItem(item.id));
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(tx('Failed to place order. Please try again.', 'ऑर्डर देने में विफल। कृपया पुनः प्रयास करें।')
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
            {tx('My Cart', 'मेरी कार्ट')}
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">
              {tx('Your cart is empty', 'आपकी कार्ट खाली है')}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {tx('Add items to get started', 'शुरू करने के लिए आइटम जोड़ें')}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="glass rounded-xl p-4 flex gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-contain rounded-lg bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {tx(item.name, item.nameHi)}
                    </h3>
                    <p className="text-lg font-bold text-primary mb-2">
                      ₹{item.price * item.quantity}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-foreground w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="default"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-6 space-y-4 ">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>{tx('Total Amount', 'कुल राशि')}</span>
                  <span className="text-primary text-2xl">₹{total}</span>
                </div>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold gradient-primary hover:opacity-90 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                <CheckCircle className="mr-2 h-6 w-6" />
                {isPlacingOrder 
                  ? (tx('Placing Order...', 'ऑर्डर दिया जा रहा है...'))
                  : (tx('Place Order', 'ऑर्डर करें'))}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {tx('✨ Free delivery in 10-15 minutes', '✨ 10-15 मिनट में मुफ्त डिलीवरी')}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;