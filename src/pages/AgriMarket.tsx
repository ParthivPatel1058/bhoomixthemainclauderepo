import { ShoppingBag, Leaf, Droplet, Wrench, Bug, Star, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import QuantityStepper from '@/components/ui/quantity-stepper';
import CartBar from '@/components/CartBar';
import CartSheet from '@/components/CartSheet';
import ProductImage from '@/components/ProductImage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AGRI_PRODUCTS as products, type Product } from '@/data/agriProducts';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

// Import product images

const categories = [
  { id: 'all', name: 'All', nameHi: 'सभी', icon: ShoppingBag, color: 'from-primary to-primary/80' },
  { id: 'seeds', name: 'Seeds', nameHi: 'बीज', icon: Leaf, color: 'from-green-500 to-emerald-600' },
  { id: 'fertilizers', name: 'Fertilizers', nameHi: 'उर्वरक', icon: Droplet, color: 'from-blue-500 to-cyan-600' },
  { id: 'tools', name: 'Tools', nameHi: 'उपकरण', icon: Wrench, color: 'from-orange-500 to-amber-600' },
  { id: 'pesticides', name: 'Pesticides', nameHi: 'कीटनाशक', icon: Bug, color: 'from-red-500 to-rose-600' },
];



interface CartItem {
  id: number;
  name: string;
  nameHi: string;
  price: number;
  quantity: number;
  image: string;
}

const AgriMarket = () => {
  const { t, language, tx } = useLanguage();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Load cart from database
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
      setIsLoadingCart(false);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const items = data.map(item => ({
        id: item.product_id,
        name: item.product_name,
        nameHi: item.product_name_hi,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoadingCart(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameHi.includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = async (product: Product) => {
    if (!user) {
      toast.error(tx('Please login to add items to cart', 'कार्ट में आइटम जोड़ने के लिए कृपया लॉगिन करें')
      );
      return;
    }

    const price = parseInt(product.price.replace(/[₹,]/g, ''));
    const existingItem = cartItems.find(item => item.id === product.id);
    
    try {
      if (existingItem) {
        // Update quantity in database
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;

        setCartItems(cartItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        // Insert new item in database
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            product_name: product.name,
            product_name_hi: product.nameHi,
            price,
            quantity: 1,
            image: product.image
          });

        if (error) throw error;

        setCartItems([...cartItems, {
          id: product.id,
          name: product.name,
          nameHi: product.nameHi,
          price,
          quantity: 1,
          image: product.image
        }]);
      }
      
      toast.success(language === 'en' 
        ? `${product.name} added to cart!` 
        : `${product.nameHi} कार्ट में जोड़ा गया!`
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(tx('Failed to add item to cart', 'कार्ट में आइटम जोड़ने में विफल')
      );
    }
  };

  const updateCartQuantity = async (id: number, change: number) => {
    if (!user) return;

    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;

    try {
      if (newQuantity <= 0) {
        await removeFromCart(id);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('user_id', user.id)
        .eq('product_id', id);

      if (error) throw error;

      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(tx('Failed to update cart', 'कार्ट अपडेट करने में विफल')
      );
    }
  };

  const removeFromCart = async (id: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id);

      if (error) throw error;

      setCartItems(cartItems.filter(item => item.id !== id));
      toast.success(tx('Item removed from cart', 'कार्ट से आइटम हटाया गया'));
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(tx('Failed to remove item', 'आइटम हटाने में विफल')
      );
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="px-4 lg:px-6 pt-5">
        <BackButton />
      </div>
      
      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mb-12">
          <PageHeader
        eyebrow={tx('Farm inputs', 'कृषि सामग्री')}
        title={t('agriMarketTitle')}
        lede={t('agriMarketDesc')}
      />
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={tx('Search products...', 'उत्पाद खोजें...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-full glass border-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'glass p-6 transition-[transform,box-shadow,border-color,background-color,color]',
                  'duration-500 ease-[var(--ease-editorial)] hover:-translate-y-1',
                  isActive && 'ring-1 ring-primary',
                )}
              >
                <div
                  className={cn(
                    'mx-auto mb-3 inline-flex rounded-md p-4 transition-colors duration-500',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-foreground/[0.06] text-foreground/70',
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="font-semibold text-foreground text-sm">
                  {tx(category.name, category.nameHi)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <Card
              key={product.id}
              className="glass hover:shadow-2xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] hover:scale-[1.02] animate-fade-in rounded-[2rem] border-2 border-primary/10"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <ProductImage
                    src={product.image}
                    alt={tx(product.name, product.nameHi)}
                    className="w-24 h-24 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="text-right">
                    <Badge 
                      variant={product.inStock ? "default" : "secondary"}
                      className={product.inStock ? "btn-liquid-glass border-0" : ""}
                    >
                      {product.inStock 
                        ? (tx('In Stock', 'उपलब्ध'))
                        : (tx('Out of Stock', 'स्टॉक खत्म'))}
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-xl leading-tight">
                  {tx(product.name, product.nameHi)}
                </CardTitle>
                
                <CardDescription className="text-sm line-clamp-2">
                  {tx(product.description, product.descriptionHi)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1 text-sm">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-primary text-primary'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground ml-2">
                    {product.rating} ({product.reviews} {tx('reviews', 'समीक्षा')})
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">{product.price}</span>
                  <span className="text-sm text-muted-foreground">{product.unit}</span>
                </div>

                <QuantityStepper
                  className="w-full"
                  store="agri"
                  productId={product.id}
                  name={product.name}
                  nameHi={product.nameHi}
                  price={parseInt(product.price.replace(/[^0-9]/g, ''), 10)}
                  image={product.image}
                  disabled={!product.inStock}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {tx('No products found', 'कोई उत्पाद नहीं मिला')}
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 glass-strong rounded-[2rem] p-4 shadow-2xl hover:scale-110 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] animate-scale-in"
        >
          <div className="relative">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </div>
        </button>
      )}

      <CartBar />
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
};

export default AgriMarket;