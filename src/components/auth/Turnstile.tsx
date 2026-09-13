import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

/**
 * Cloudflare Turnstile — the CAPTCHA provider Supabase Auth verifies natively.
 *
 * Renders nothing unless VITE_TURNSTILE_SITE_KEY is set, so a project that has
 * not enabled it behaves exactly as before. Once the key is set here AND
 * "Bot and Abuse Protection → Turnstile" is on in the Supabase dashboard,
 * every password sign-in, sign-up and password reset carries a token that
 * Supabase checks against Cloudflare before touching the account. A missing
 * or reused token is rejected server-side, so this cannot be bypassed by
 * simply not rendering the widget.
 *
 * Uses Turnstile's explicit render API directly rather than a wrapper
 * package: it is ~40 lines, and one fewer dependency in the auth path.
 */

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

/** True when the widget is configured; callers gate their token checks on this. */
export const turnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Tokens are single-use: call after any failed submit to issue a new one. */
  reset: () => void;
}

interface Props {
  onToken: (token: string | null) => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile(
  { onToken, theme = "light", className },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      onTokenRef.current(null);
    },
  }));

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !host.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !host.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(host.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [theme]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={host} className={className} />;
});

export default Turnstile;
