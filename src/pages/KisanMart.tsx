import { ShoppingCart, Zap, Search, Clock } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import CartBar from '@/components/CartBar';
import ProductImage from '@/components/ProductImage';
import QuantityStepper from '@/components/ui/quantity-stepper';
import { toast } from 'sonner';
import { MART_PRODUCTS as products, MART_CATEGORIES as categories } from '@/data/martProducts';

const KisanMart = () => {
  const { t, language, tx } = useLanguage();
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const addToCart = (productId: number, productName: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
    toast.success(
      tx('{item} added to cart', '{item} कार्ट में जोड़ा गया').replace('{item}', productName),
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartItems = () => {
    return Object.entries(cart).map(([id, quantity]) => {
      const product = products.find(p => p.id === Number(id))!;
      return {
        id: product.id,
        name: product.name,
        nameHi: product.nameHi,
        price: product.price,
        quantity,
        image: product.image,
      };
    });
  };

  const handleUpdateCartQuantity = (id: number, change: number) => {
    if (change > 0) {
      const product = products.find(p => p.id === id);
      if (product) {
        addToCart(id, product.name);
      }
    } else {
      removeFromCart(id);
    }
  };

  const handleRemoveFromCart = (id: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[id];
      return newCart;
    });
    toast.info(tx('Item removed from cart', 'आइटम कार्ट से हटाया गया'));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-24">
      <Navigation />

      <div className="px-4 lg:px-6 pt-5">
        <BackButton />
      </div>
      
      {/* Sticky header — stays in flow so it respects the sidebar offset */}
      <div className="sticky top-[76px] z-40 mx-3 lg:mx-4 xl:mx-6 mt-4 glass-strong !rounded-2xl">
        <div className="px-4 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                <Zap className="h-6 w-6 text-secondary" />
                {t('kisanMartTitle')}
              </h1>
              <p className="text-sm text-muted-foreground">{tx('Delivery in 10-15 mins', '10-15 मिनट में डिलीवरी')}</p>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative glass rounded-2xl px-4 py-3 flex items-center gap-2 hover:bg-primary/10 transition-all"
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">{getCartCount()}</span>
              {getCartCount() > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                  {getCartCount()}
                </div>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={tx('Search groceries...', 'किराना खोजें...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass rounded-2xl pl-12 pr-4 py-3 border-primary/20 focus:border-primary/40 outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-primary text-primary-foreground'
                  : 'glass text-foreground hover:bg-primary/10'
              }`}
            >
              {tx('All', 'सभी')}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex-shrink-0 px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? 'bg-primary text-primary-foreground'
                    : 'glass text-foreground hover:bg-primary/10'
                }`}
              >
                <span>{category.emoji}</span>
                <span>{tx(category.name, category.nameHi)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid - Mobile App Style */}
      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            /*
              Solid `bg-card`, not `glass`: over the app's fixed photographic
              backdrop a translucent card let the scene bleed through the text
              half, tinting the product name and price a murky olive.
            */
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-square bg-white p-4">
                <ProductImage
                  src={product.image}
                  alt={tx(product.name, product.nameHi)}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col p-3">
                <span className="mb-1.5 flex w-fit items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {tx('10 MINS', '10 मिनट')}
                </span>

                <h3 className="mb-0.5 line-clamp-2 text-sm font-semibold text-foreground">
                  {tx(product.name, product.nameHi)}
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  {tx(product.tag, product.tagHi)}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-foreground">₹{product.price}</span>
                  <QuantityStepper
                    store="mart"
                    productId={product.id}
                    name={product.name}
                    nameHi={product.nameHi}
                    price={product.price}
                    image={product.image}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {tx('No products found', 'कोई उत्पाद नहीं मिला')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {tx('Try adjusting your search or filters', 'अपनी खोज या फ़िल्टर समायोजित करें')}
            </p>
          </div>
        )}
      </div>

      <CartBar />
    </div>
  );
};

export default KisanMart;
