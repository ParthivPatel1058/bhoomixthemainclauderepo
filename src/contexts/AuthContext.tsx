import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Supabase reports the same signed-in user through both `onAuthStateChange`
   * and `getSession`, and refreshes the token periodically — each emission is a
   * fresh object. Reusing the previous object when nothing meaningful changed
   * keeps `user` referentially stable, so the `[user]` effects across the app
   * (cart, addresses, orders) fetch once per sign-in instead of once per
   * emission.
   */
  const applyUser = useCallback((next: User | null) => {
    setUser((prev) => {
      if (!prev || !next) return next;
      const same =
        prev.id === next.id &&
        prev.email === next.email &&
        prev.updated_at === next.updated_at;
      return same ? prev : next;
    });
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        applyUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      applyUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [applyUser]);

  const signOut = useCallback(async () => {
    // Navigate regardless of the network result: if the call fails the local
    // session is still cleared, and stranding the user on a protected page
    // is worse than a stale server-side session.
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore — local state is cleared by onAuthStateChange */
    } finally {
      setUser(null);
      setSession(null);
      navigate('/auth/welcome', { replace: true });
    }
  }, [navigate]);

  // AuthProvider sits above almost every route, so a new object here on every
  // render would re-render every useAuth() consumer in the tree even when
  // nothing auth-related changed. Memoizing keeps identity stable across
  // unrelated re-renders (e.g. a route change bubbling through providers).
  const value = useMemo(
    () => ({ user, session, signOut, loading }),
    [user, session, signOut, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
