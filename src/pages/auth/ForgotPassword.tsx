import { useEffect, useRef, useState } from "react";
import Turnstile, { turnstileEnabled, type TurnstileHandle } from "@/components/auth/Turnstile";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Button3D from "@/components/ui/button-3d";
import BrandRipple from "@/components/BrandRipple";
import {
  ArrowLeft,
  Mail,
  ArrowRight,
  MailCheck,
  Phone,
  Loader2,
} from "lucide-react";

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(255);

/** Seconds before the email can be sent again. */
const RESEND_COOLDOWN = 45;

/**
 * Step one of password recovery: prove you own the address.
 *
 * The success screen is shown whether or not the address exists. Telling a
 * stranger "no account with that email" turns this form into a way to
 * enumerate who has an account, so the answer is always the same.
 */
export default function ForgotPassword() {
  const { tx } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      emailSchema.parse(email);
    } catch {
      toast.error(tx("Enter a valid email address", "सही ईमेल पता डालें"));
      return;
    }

    if (turnstileEnabled && !captcha) {
      toast.error(tx("Please complete the security check", "कृपया सुरक्षा जाँच पूरी करें"));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        captchaToken: captcha ?? undefined,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      },
    );
    turnstile.current?.reset();
    setLoading(false);

    if (error) {
      // Rate limiting and server errors are real failures and must be shown.
      // "No such user" must not be: a different answer for a registered
      // address turns this form into a way to enumerate who has an account.
      // A 5xx means our mail provider is broken, not that the email is wrong,
      // and pretending it succeeded leaves the user waiting for nothing.
      if (/rate|too many/i.test(error.message)) {
        toast.error(
          tx(
            "Too many attempts. Wait a minute and try again.",
            "बहुत बार कोशिश की। एक मिनट रुककर दोबारा करें।",
          ),
        );
        return;
      }
      if (error.status && error.status >= 500) {
        toast.error(
          tx(
            "We could not send the email right now. Please try again shortly.",
            "अभी ईमेल नहीं भेजा जा सका। थोड़ी देर बाद कोशिश करें।",
          ),
        );
        console.error("password reset send failed:", error.message);
        return;
      }
    }

    setSent(true);
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:grid-cols-2">
        <div className="relative hidden md:block">
          <BrandRipple />
        </div>

        <div className="relative p-7 sm:p-10">
          <button
            onClick={() => navigate("/auth/login")}
            aria-label={tx("Back to sign in", "साइन इन पर वापस")}
            className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {!sent ? (
            <>
              <div className="mb-7">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {tx("Reset your password", "पासवर्ड रीसेट करें")}
                </h1>
                <p className="mt-1.5 text-muted-foreground">
                  {tx(
                    "Enter your email and we will send you a link to set a new one.",
                    "अपना ईमेल डालें, हम नया पासवर्ड बनाने का लिंक भेजेंगे।",
                  )}
                </p>
              </div>

              <form onSubmit={send} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">{tx("Email", "ईमेल")}</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Turnstile ref={turnstile} onToken={setCaptcha} className="mt-4" />
                <Button3D
                  type="submit"
                  tone="emerald"
                  disabled={loading}
                  className="!mt-7"
                >
                  {loading
                    ? tx("Sending…", "भेजा जा रहा है…")
                    : tx("Send reset link", "रीसेट लिंक भेजें")}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button3D>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <MailCheck className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {tx("Check your email", "अपना ईमेल देखें")}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {tx(
                  "If an account exists for {e}, a reset link is on its way. It expires in one hour.",
                  "अगर {e} का खाता है, तो रीसेट लिंक भेजा गया है। यह एक घंटे में समाप्त हो जाएगा।",
                ).replace("{e}", email)}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {tx(
                  "Not in your inbox? Check spam — it comes from Supabase.",
                  "इनबॉक्स में नहीं है? स्पैम देखें — यह Supabase से आता है।",
                )}
              </p>

              <div className="mt-7 space-y-3">
                <Button
                  variant="outline"
                  className="h-12 w-full"
                  disabled={cooldown > 0 || loading}
                  onClick={() => send()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : cooldown > 0 ? (
                    tx("Resend in {s}s", "{s} सेकंड में दोबारा").replace(
                      "{s}",
                      String(cooldown),
                    )
                  ) : (
                    tx("Resend email", "ईमेल दोबारा भेजें")
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="min-h-11 w-full text-sm text-primary hover:underline"
                >
                  {tx("Use a different email", "दूसरा ईमेल इस्तेमाल करें")}
                </button>
              </div>
            </>
          )}

          {/* No email at all is common here, so offer the route that does not
              need one rather than leaving the user stuck. */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">
              {tx("or", "या")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Link
            to="/auth/login?method=phone"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Phone className="h-4 w-4" />
            {tx("Sign in with mobile instead", "मोबाइल से साइन इन करें")}
          </Link>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {tx("Remembered it?", "याद आ गया?")}{" "}
            <Link
              to="/auth/login"
              className="font-semibold text-primary hover:underline"
            >
              {tx("Sign in", "साइन इन करें")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
