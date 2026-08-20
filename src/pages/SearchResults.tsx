import { useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import CartBar from '@/components/CartBar';
import ProductImage from '@/components/ProductImage';
import QuantityStepper from '@/components/ui/quantity-stepper';
import { useLanguage } from '@/contexts/LanguageContext';
import { AGRI_PRODUCTS } from '@/data/agriProducts';
import { MART_PRODUCTS } from '@/data/martProducts';
import { Search, PackageSearch } from 'lucide-react';

/**
 * Cross-catalogue search.
 *
 * Both search inputs used to navigate to /agri-market?search=… but that page
 * never read the parameter, so searching silently did nothing. Results now
 * come from a page that actually reads the query, and it spans both stores so
 * one search box covers the whole app.
 */
export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { tx } = useLanguage();
  const query = (params.get('q') ?? '').trim();

  const { agri, mart } = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return { agri: [], mart: [] };
    // Match either script so a Hindi query finds Hindi names.
    const hit = (...fields: (string | undefined)[]) =>
      fields.filter(Boolean).join(' ').toLowerCase().includes(q);

    return {
      agri: AGRI_PRODUCTS.filter((p) =>
        hit(p.name, p.nameHi, p.category, p.description, p.descriptionHi),
      ),
      mart: MART_PRODUCTS.filter((p) => hit(p.name, p.nameHi, p.category)),
    };
  }, [query]);

  const total = agri.length + mart.length;

  return (
    <div className="min-h-screen pb-24">
      <Navigation />

      <div className="px-4 pt-5 lg:px-6">
        <BackButton />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            {tx('Search results', 'खोज परिणाम')}
          </p>
          <h1 className="page-title text-foreground">
            {query ? `"${query}"` : tx('Search BhoomiX', 'BhoomiX में खोजें')}
          </h1>
          {query && (
            <p className="mt-2 text-muted-foreground">
              {tx('{n} results found', '{n} परिणाम मिले').replace('{n}', String(total))}
            </p>
          )}
        </header>

        {query && total === 0 && (
          <div className="glass rounded-3xl p-12 text-center">
            <PackageSearch className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg font-semibold text-foreground">
              {tx('Nothing matched that search', 'उस खोज से कुछ नहीं मिला')}
            </p>
            <p className="mt-2 text-muted-foreground">
              {tx(
                'Try a shorter word, or browse the market instead.',
                'छोटा शब्द आज़माएं, या बाज़ार देखें।',
              )}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/agri-market"
                className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
              >
                {tx('Agri Market', 'कृषि बाज़ार')}
              </Link>
              <Link to="/kisan-mart" className="glass rounded-full px-5 py-2.5 font-semibold">
                {tx('AgriNova Mart', 'एग्रीनोवा मार्ट')}
              </Link>
            </div>
          </div>
        )}

        {agri.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold text-foreground">
              {tx('Agri Market', 'कृषि बाज़ार')}{' '}
              <span className="text-base font-normal text-muted-foreground">({agri.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {agri.map((p) => (
                <div key={`a-${p.id}`} className="glass overflow-hidden rounded-2xl">
                  <button
                    onClick={() => navigate('/agri-market')}
                    className="block aspect-square w-full bg-white p-4"
                  >
                    <ProductImage
                      src={p.image}
                      alt={tx(p.name, p.nameHi)}
                      className="h-full w-full object-contain"
                    />
                  </button>
                  <div className="p-3">
                    <h3 className="mb-1 line-clamp-2 text-sm font-bold text-foreground">
                      {tx(p.name, p.nameHi)}
                    </h3>
                    <p className="mb-2 text-xs text-muted-foreground">{p.unit}</p>
                    <div className="mb-3 text-lg font-bold text-primary">₹{p.price}</div>
                    <QuantityStepper
                      className="w-full"
                      store="agri"
                      productId={p.id}
                      name={p.name}
                      nameHi={p.nameHi}
                      price={Number(String(p.price).replace(/[^\d.]/g, '')) || 0}
                      image={p.image}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {mart.length > 0 && (
          <section>
            <h2 className="mb-5 text-2xl font-bold text-foreground">
              {tx('AgriNova Mart', 'एग्रीनोवा मार्ट')}{' '}
              <span className="text-base font-normal text-muted-foreground">({mart.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {mart.map((p) => (
                <div key={`m-${p.id}`} className="glass overflow-hidden rounded-2xl">
                  <div className="aspect-square bg-white p-4">
                    <ProductImage
                      src={p.image}
                      alt={tx(p.name, p.nameHi)}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="mb-1 line-clamp-2 text-sm font-bold text-foreground">
                      {tx(p.name, p.nameHi)}
                    </h3>
                    <p className="mb-2 text-xs text-muted-foreground">{tx(p.tag, p.tagHi)}</p>
                    <div className="mb-3 text-lg font-bold text-primary">₹{p.price}</div>
                    <QuantityStepper
                      className="w-full"
                      store="mart"
                      productId={p.id}
                      name={p.name}
                      nameHi={p.nameHi}
                      price={p.price}
                      image={p.image}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <CartBar />
    </div>
  );
}
