import { ShoppingBag, Leaf, Droplet, Wrench, Bug, Star, Search } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import QuantityStepper from '@/components/ui/quantity-stepper';
import CartBar from '@/components/CartBar';
import ProductImage from '@/components/ProductImage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AGRI_PRODUCTS as products } from '@/data/agriProducts';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import SpotlightCard from '@/components/SpotlightCard';

const categories = [
  { id: 'all', name: 'All', nameHi: 'सभी', icon: ShoppingBag, color: 'from-primary to-primary/80' },
  { id: 'seeds', name: 'Seeds', nameHi: 'बीज', icon: Leaf, color: 'from-green-500 to-emerald-600' },
  { id: 'fertilizers', name: 'Fertilizers', nameHi: 'उर्वरक', icon: Droplet, color: 'from-blue-500 to-cyan-600' },
  { id: 'tools', name: 'Tools', nameHi: 'उपकरण', icon: Wrench, color: 'from-orange-500 to-amber-600' },
  { id: 'pesticides', name: 'Pesticides', nameHi: 'कीटनाशक', icon: Bug, color: 'from-red-500 to-rose-600' },
];

/**
 * Agri Market.
 *
 * The page holds no cart state of its own. It used to: a local `cartItems`
 * array, its own `cart_items` reads and writes, and a `CartSheet` checkout —
 * all of which were stranded when the product cards moved to
 * `QuantityStepper`, which goes through `CartContext`. Nothing called
 * `addToCart` any more, but the stale local snapshot still fed a floating cart
 * button and a second "Place order" that wrote an order with no delivery
 * address on it.
 *
 * One cart, one checkout: `CartBar` opens `CartDrawer`, which requires an
 * address and snapshots it onto the order.
 */
const AgriMarket = () => {
  const { t, language, tx } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameHi.includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <SpotlightCard
              key={product.id}
              className="glass animate-fade-in overflow-hidden transition-[box-shadow,border-color] duration-500 hover:shadow-floating"
              spotlightColor="rgba(31, 122, 90, 0.16)"
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
            </SpotlightCard>
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
      <CartBar />
    </div>
  );
};

export default AgriMarket;