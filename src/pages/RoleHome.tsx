import { Navigate } from 'react-router-dom';
import { BounceLoader } from '@/components/ui/bounce-loader';
import { useAccount } from '@/hooks/useAccount';
import { useLanguage } from '@/contexts/LanguageContext';
import Index from '@/pages/Index';

/**
 * Decides what "home" means for whoever just signed in.
 *
 * Only delivery partners are sent elsewhere: their day is a list of runs and
 * a seed catalogue is no use to them. Admins and managers get the farmer home
 * like everyone else, and reach their tools from the sidebar.
 *
 * An earlier version redirected staff to /staff-accounts too, which quietly
 * trapped them — the sidebar's "Overview" points at "/", so every attempt to
 * reach the farmer app bounced straight back to the staff screen. Sending a
 * role away from the one route that means "home" is a cage, not a shortcut.
 */
export default function RoleHome() {
  const { isPartner, loading } = useAccount();
  const { tx } = useLanguage();

  // Rendering the farmer home and then redirecting would flash the wrong
  // screen at exactly the moment the app is being demonstrated.
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <BounceLoader label={tx('Loading', 'लोड हो रहा है')} />
        <span className="text-muted-foreground">{tx('Loading…', 'लोड हो रहा है…')}</span>
      </div>
    );
  }

  if (isPartner) return <Navigate to="/partner-orders" replace />;
  return <Index />;
}
