import { useMemo, useState } from 'react';
import { ShoppingBag, Leaf, Droplet, Wrench, Sprout, FlaskConical, Star, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import QuantityStepper from '@/components/ui/quantity-stepper';
import CartBar from '@/components/CartBar';
import ProductImage from '@/components/ProductImage';
import { Input } from '@/components/ui/input';
import { AGRI_PRODUCTS as products } from '@/data/agriProducts';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

/**
 * Agri Market — fertilisers, soil amendments, bio-inputs and seed.
 *
 * Pesticides are deliberately absent. Their sale is licensed under the
 * Insecticides Act and carries obligations a storefront like this does not
 * meet, so the catalogue covers only what feeds a crop or starts one.
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

const categories = [
  { id: 'all', name: 'All', nameHi: 'सभी', icon: ShoppingBag },
  { id: 'seeds', name: 'Seeds', nameHi: 'बीज', icon: Sprout },
  { id: 'fertilizers', name: 'Fertilizers', nameHi: 'उर्वरक', icon: Droplet },
  { id: 'organic', name: 'Organic & Bio', nameHi: 'जैविक', icon: Leaf },
  { id: 'micronutrients', name: 'Micronutrients', nameHi: 'सूक्ष्म पोषक', icon: FlaskConical },
  { id: 'tools', name: 'Tools', nameHi: 'उपकरण', icon: Wrench },
];

/** '₹1,350' -> 1350. The catalogue stores display strings, not numbers. */
function priceValue(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

const AgriMarket = () => {
  const { t, tx } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.nameHi.includes(searchQuery.trim()) ||
        product.description.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  /** Per-category counts, so the pills say how much is actually behind them. */
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: products.length };
    for (const p of products) map[p.category] = (map[p.category] || 0) + 1;
    return map;
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="px-4 lg:px-6 pt-5">
        <BackButton />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <PageHeader
            eyebrow={tx('Farm inputs', 'कृषि सामग्री')}
            title={t('agriMarketTitle')}
            lede={t('agriMarketDesc')}
          />

          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={tx('Search seeds, fertilizers…', 'बीज, उर्वरक खोजें…')}
                aria-label={tx('Search products', 'उत्पाद खोजें')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-full glass border-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Category pills. A horizontal scroller rather than a grid of tiles:
            six categories in a 2-column grid pushed the products below the
            fold on a phone, which is where most of this traffic is. */}
        <div className="mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
                    'transition-[background-color,color,border-color] duration-300',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border/60 bg-card text-foreground/75 hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tx(category.name, category.nameHi)}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                      isActive ? 'bg-primary-foreground/20' : 'bg-foreground/[0.07]',
                    )}
                  >
                    {counts[category.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {tx('This season’s inputs', 'इस मौसम की सामग्री')}
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {filteredProducts.length} {tx('products', 'उत्पाद')}
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card',
                'transition-[box-shadow,border-color,transform] duration-300',
                'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-floating',
              )}
            >
              {product.onSale && (
                <span className="absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                  {tx('On Sale', 'सेल')}
                </span>
              )}

              {!product.inStock && (
                <span className="absolute right-2 top-2 z-10 rounded-md bg-foreground/70 px-2 py-1 text-[10px] font-semibold text-background">
                  {tx('Out of stock', 'स्टॉक खत्म')}
                </span>
              )}

              <div className="flex h-32 items-center justify-center bg-white p-3 sm:h-36 dark:bg-white/[0.04]">
                <ProductImage
                  src={product.image}
                  alt={tx(product.name, product.nameHi)}
                  className="h-full w-full rounded-lg object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <div
                  className="flex items-center gap-0.5"
                  aria-label={`${product.rating} ${tx('out of 5', 'में से 5')}`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={cn(
                        'h-3 w-3',
                        i < Math.round(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30',
                      )}
                    />
                  ))}
                  <span className="ml-1 text-[10px] text-muted-foreground tabular-nums">
                    ({product.reviews})
                  </span>
                </div>

                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                  {tx(product.name, product.nameHi)}
                </h3>

                {/* The tool rows carry no pack size, so skip the line rather
                    than leaving an empty one that misaligns the card. */}
                {product.unit.trim() && (
                  <p className="text-xs text-muted-foreground">
                    {product.unit.replace(/^\//, '')}
                  </p>
                )}

                <div className="mt-auto flex items-baseline gap-2 pt-1">
                  <span
                    className={cn(
                      'text-base font-bold',
                      product.onSale ? 'text-destructive' : 'text-foreground',
                    )}
                  >
                    {product.price}
                  </span>
                  {product.mrp && (
                    <span className="text-xs text-muted-foreground line-through">
                      {product.mrp}
                    </span>
                  )}
                </div>

                <QuantityStepper
                  className="mt-2 w-full"
                  store="agri"
                  productId={product.id}
                  name={product.name}
                  nameHi={product.nameHi}
                  price={priceValue(product.price)}
                  image={product.image}
                  disabled={!product.inStock}
                />
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">
              {tx('No products found', 'कोई उत्पाद नहीं मिला')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-sm font-medium text-primary underline underline-offset-4"
            >
              {tx('Clear filters', 'फ़िल्टर हटाएँ')}
            </button>
          </div>
        )}
      </div>

      <CartBar />
    </div>
  );
};

export default AgriMarket;
