import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import VideoWordmark from '@/components/VideoWordmark';

/** Site footer, closing on the full-bleed video wordmark. */
export default function Footer() {
  const { tx } = useLanguage();

  const columns = [
    {
      heading: tx('Grow', 'उगाएं'),
      links: [
        { label: tx('Crop AI', 'फसल एआई'), href: '/crop-disease' },
        { label: tx('Advisory', 'सलाह'), href: '/kisan-help' },
        { label: tx('Organic Farming', 'जैविक खेती'), href: '/organic-farming' },
        { label: tx('Vegetable Farming', 'सब्जी की खेती'), href: '/vegetable-farming' },
      ],
    },
    {
      heading: tx('Buy & Sell', 'खरीदें और बेचें'),
      links: [
        { label: tx('Agri Market', 'कृषि बाज़ार'), href: '/agri-market' },
        { label: tx('My Orders', 'मेरे ऑर्डर'), href: '/orders' },
      ],
    },
    {
      heading: tx('More', 'और'),
      links: [
        { label: tx('Government Schemes', 'सरकारी योजनाएं'), href: '/gov-schemes' },
        { label: tx('Support', 'सहायता'), href: '/support' },
        { label: tx('Settings', 'सेटिंग्स'), href: '/settings' },
      ],
    },
  ];

  // Deliberately not opaque. The footer used to paint `bg-background` to stop
  // the sky showing through and washing out the links; now the whole page
  // carries the ink scrim, so the links already have a dark ground and an
  // opaque panel here would just cut a rectangle out of the photograph.
  return (
    <footer className="relative mt-24 border-t border-white/10">
      <div className="container mx-auto px-4 py-14 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-8">
            <p className="font-display text-lg font-bold text-foreground">bhoomix</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tx(
                'Tools and advisory for every farming decision — in your own language.',
                'हर खेती के फैसले के लिए उपकरण और सलाह — आपकी अपनी भाषा में।',
              )}
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="mb-3 text-sm font-semibold text-foreground">{col.heading}</h2>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} bhoomix</p>
          <p>{tx('Made for India’s farmers', 'भारत के किसानों के लिए बनाया गया')}</p>
        </div>
      </div>

      {/* Full-bleed closing wordmark; the video plays inside the letters. */}
      <VideoWordmark className="mt-4" />
    </footer>
  );
}
