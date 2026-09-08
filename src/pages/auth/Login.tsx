import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BrandRipple from "@/components/BrandRipple";
import BhoomixMark from "@/components/BhoomixMark";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Lock,
  ArrowRight,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  ScanLine,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(100),
});

/** Indian mobile numbers, with or without the +91 the user may type. */
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?91)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

type Method = "email" | "phone";

/**
 * supabase-js wraps a non-2xx function response in a FunctionsHttpError and
 * puts the real message in the response body, so the useful text is one await
 * away rather than on `error.message`.
 */
async function readFunctionError(error: unknown): Promise<string | null> {
  const res = (error as { context?: Response })?.context;
  if (res && typeof res.json === "function") {
    try {
      const body = await res.json();
      if (body?.error) return String(body.error);
    } catch {
      /* fall through to the generic message */
    }
  }
  return (error as Error)?.message ?? null;
}

/**
 * True only when the endpoint itself is absent — a network failure or a 404.
 * A deployed function answering 401 or 403 is a decision, not an outage, and
 * must never be treated as "fall back to the weaker path".
 */
async function isFunctionMissing(error: unknown): Promise<boolean> {
  const res = (error as { context?: Response })?.context;
  if (res && typeof res.status === "number") return res.status === 404;
  const name = (error as Error)?.name ?? "";
  const message = (error as Error)?.message ?? "";
  return /FunctionsFetchError/.test(name) || /Failed to (fetch|send)/i.test(message);
}

/* Clay surfaces, defined once so every control shares one light source.
   Claymorphism only reads as soft when the inner highlight and the outer
   drop shadow agree on where the light comes from — here, top-left. */
const CLAY_INPUT =
  "h-14 rounded-2xl border-0 bg-white/70 pl-12 text-[15px] text-stone-800 " +
  "placeholder:text-stone-400 shadow-[inset_0_2px_6px_rgba(120,113,108,0.14),0_1px_0_rgba(255,255,255,0.9)] " +
  "focus-visible:ring-2 focus-visible:ring-emerald-600/40 focus-visible:ring-offset-0";

const CLAY_CARD =
  "rounded-3xl bg-white/85 backdrop-blur-md shadow-[0_10px_30px_-8px_rgba(60,60,50,0.28),inset_0_1px_0_rgba(255,255,255,0.95)]";

const CLAY_BUTTON =
  "mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl " +
  "bg-gradient-to-b from-emerald-500 to-emerald-700 text-[15px] font-semibold text-white " +
  "shadow-[0_12px_24px_-8px_rgba(6,95,70,0.65),inset_0_2px_0_rgba(255,255,255,0.3)] " +
  "transition-transform active:translate-y-0.5 disabled:opacity-60";

export default function Login() {
  const navigate = useNavigate();
  const { tx } = useLanguage();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get("next") ?? "";
  const nextPath =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  /** Set once the server has emailed a code; drives the second step. */
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  // Many farmers have a mobile number but no email address, so phone sign-in
  // is offered as an equal option rather than hidden behind "more ways".
  // Honour ?method=phone so "sign in with mobile instead" lands ready to go.
  const [method, setMethod] = useState<Method>(
    searchParams.get("method") === "phone" ? "phone" : "email",
  );
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const e164 = (raw: string) => "+91" + raw.replace(/\D/g, "").slice(-10);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      phoneSchema.parse(phone);
    } catch {
      toast.error(
        tx(
          "Enter a valid 10-digit mobile number",
          "सही 10 अंकों का मोबाइल नंबर डालें",
        ),
      );
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164(phone) });
    setLoading(false);

    if (error) {
      // Phone auth needs an SMS provider configured on the Supabase project.
      // Say so plainly instead of showing a raw provider error.
      const notConfigured = /provider|not enabled|unsupported|sms/i.test(
        error.message,
      );
      toast.error(
        notConfigured
          ? tx(
              "Phone sign-in is not enabled yet. Use email for now.",
              "फ़ोन साइन-इन अभी चालू नहीं है। अभी ईमेल इस्तेमाल करें।",
            )
          : error.message,
      );
      return;
    }
    setOtpSent(true);
    toast.success(tx("Code sent to your phone", "आपके फ़ोन पर कोड भेजा गया"));
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: e164(phone),
      token: otp.trim(),
      type: "sms",
    });
    setLoading(false);

    if (error) {
      toast.error(
        tx(
          "That code is not right. Try again.",
          "यह कोड सही नहीं है। दोबारा कोशिश करें।",
        ),
      );
      return;
    }
    toast.success(tx("Welcome back!", "वापसी पर स्वागत है!"));
    if (nextPath === "/") navigate("/");
    else window.location.href = nextPath;
  };

  /** Trade the one-time token from the server for a real session. */
  const completeSignIn = async (tokenHash: string) => {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });
    if (error) {
      toast.error(tx("Could not complete sign-in", "साइन इन पूरा नहीं हो सका"));
      return;
    }
    toast.success(tx("Welcome back!", "वापसी पर स्वागत है!"));
    if (nextPath === "/") navigate("/");
    else window.location.href = nextPath;
  };

  /**
   * Step one. The password goes to the edge function, not straight to the auth
   * API: calling signInWithPassword here would hand this browser a working
   * session before any code is entered, which would make the code screen
   * decorative. The server decides whether a second factor is needed.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Derived from the schema rather than restated by hand: the literal
    // version drifted from what `parse` actually returns and the two stopped
    // type-checking against each other.
    let validated: z.infer<typeof loginSchema>;
    try {
      validated = loginSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) toast.error(error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("login-2fa", {
        body: {
          action: "start",
          email: validated.email,
          password: validated.password,
        },
      });

      // TEMPORARY. Until `login-2fa` is deployed the function is simply not
      // there, and without this the sign-in page is dead for everyone. Only a
      // missing endpoint falls through — a real 401 or 403 from a deployed
      // function is an answer, not an outage, and must not be retried here.
      //
      // Delete this block the moment the function is live. While it exists,
      // anyone who can stop that one request from completing gets password-only
      // sign-in, which is the very bypass the function was written to close.
      if (error && (await isFunctionMissing(error))) {
        console.warn("login-2fa is not deployed; falling back to password sign-in");
        const { error: pwError } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });
        if (pwError) {
          toast.error(
            /Invalid login credentials/.test(pwError.message)
              ? tx("Invalid email or password", "ईमेल या पासवर्ड ग़लत है")
              : pwError.message,
          );
          return;
        }
        toast.success(tx("Welcome back!", "वापसी पर स्वागत है!"));
        if (nextPath === "/") navigate("/");
        else window.location.href = nextPath;
        return;
      }

      // A non-2xx from the function arrives as an error with the body attached.
      const message =
        (data as { error?: string } | null)?.error ??
        (error ? await readFunctionError(error) : null);

      if (message) {
        toast.error(message);
        return;
      }

      const result = data as { needsCode?: boolean; challengeId?: string; tokenHash?: string };

      if (result.needsCode && result.challengeId) {
        setChallengeId(result.challengeId);
        setCode("");
        toast.success(
          tx("We sent a code to your email", "हमने आपके ईमेल पर कोड भेजा है"),
        );
        return;
      }

      if (result.tokenHash) {
        await completeSignIn(result.tokenHash);
        return;
      }

      toast.error(tx("Could not sign in", "साइन इन नहीं हो सका"));
    } finally {
      setLoading(false);
    }
  };

  /** Step two: exchange the emailed code for a session. */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("login-2fa", {
        body: { action: "verify", challengeId, code: code.trim() },
      });

      const message =
        (data as { error?: string } | null)?.error ??
        (error ? await readFunctionError(error) : null);

      if (message) {
        toast.error(message);
        // A spent or expired challenge cannot be retried; send them back to
        // the password step rather than leaving them typing into a dead form.
        if (/expired|already used|Sign in again/i.test(message)) {
          setChallengeId(null);
          setCode("");
        }
        return;
      }

      const tokenHash = (data as { tokenHash?: string }).tokenHash;
      if (tokenHash) await completeSignIn(tokenHash);
      else toast.error(tx("Could not sign in", "साइन इन नहीं हो सका"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${nextPath}` },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#9fa6b0] via-[#aeb3ba] to-[#c2c6cb] p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#f6f6f3] via-[#f2f4ec] to-[#e4efd6] shadow-[0_45px_90px_-25px_rgba(30,40,25,0.55)] md:grid-cols-2">
        {/* ── Form ─────────────────────────────────────────────── */}
        <div className="order-last flex flex-col p-7 sm:p-10 md:order-first">
          <div className="mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/60 px-4 py-2 font-display text-lg font-semibold text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <BhoomixMark size={20} className="text-emerald-600" />
              bhoomix
            </span>
            <button
              onClick={() => navigate("/auth/welcome")}
              aria-label={tx("Back", "वापस")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-stone-500 shadow-[0_4px_10px_-3px_rgba(60,60,50,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-7 text-center">
            <h1 className="font-display text-[clamp(1.5rem,4.5vw,2.125rem)] font-semibold leading-tight text-stone-800 [overflow-wrap:anywhere]">
              {tx("Welcome back", "वापसी पर स्वागत है")}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {tx(
                "Sign in to continue to bhoomix",
                "bhoomix में जारी रखने के लिए साइन इन करें",
              )}
            </p>
          </div>

          {/* Second factor. Replaces the whole form: the password step is done
              and there is nothing useful to go back to except starting over. */}
          {challengeId && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <p className="text-sm text-stone-600">
                  {tx(
                    "We emailed a six digit code to {e}. It expires in 10 minutes.",
                    "हमने {e} पर छह अंकों का कोड भेजा है। यह 10 मिनट में समाप्त होगा।",
                  ).replace("{e}", formData.email)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="pl-1 text-xs text-stone-500">
                  {tx("Six digit code", "छह अंकों का कोड")}
                </Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className={`${CLAY_INPUT} tracking-[0.4em]`}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className={CLAY_BUTTON}
              >
                {loading
                  ? tx("Checking…", "जाँच हो रही है…")
                  : tx("Verify and sign in", "जाँचें और साइन इन करें")}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setChallengeId(null);
                  setCode("");
                }}
                className="w-full py-1 text-center text-sm text-stone-500 hover:text-stone-800"
              >
                {tx("Start over", "फिर से शुरू करें")}
              </button>
            </form>
          )}

          {/* Two equal ways in. */}
          <div
            className={`mb-6 grid grid-cols-2 gap-1.5 rounded-2xl bg-stone-500/10 p-1.5 shadow-[inset_0_2px_6px_rgba(120,113,108,0.16)] ${
              challengeId ? "hidden" : ""
            }`}
          >
            {(["email", "phone"] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] ${
                  method === m
                    ? "bg-white text-stone-800 shadow-[0_4px_10px_-3px_rgba(60,60,50,0.28),inset_0_1px_0_rgba(255,255,255,0.95)]"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {m === "email" ? (
                  <Mail className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {m === "email" ? tx("Email", "ईमेल") : tx("Mobile", "मोबाइल")}
              </button>
            ))}
          </div>

          {method === "phone" && !challengeId && (
            <form onSubmit={otpSent ? verifyOtp : sendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="pl-1 text-xs text-stone-500">
                  {tx("Mobile number", "मोबाइल नंबर")}
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                  <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-stone-500">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${CLAY_INPUT} pl-[5.25rem]`}
                    required
                    disabled={loading || otpSent}
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="pl-1 text-xs text-stone-500">
                    {tx("Six-digit code", "छह अंकों का कोड")}
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                    <Input
                      id="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`${CLAY_INPUT} tracking-[0.4em]`}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="pl-1 text-sm font-medium text-emerald-700 hover:underline"
                  >
                    {tx("Change number", "नंबर बदलें")}
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className={CLAY_BUTTON}>
                {loading
                  ? tx("Please wait…", "कृपया रुकें…")
                  : otpSent
                    ? tx("Verify and sign in", "जाँचें और साइन इन करें")
                    : tx("Send code", "कोड भेजें")}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          <form
            onSubmit={handleLogin}
            className={`space-y-4 ${method === "email" && !challengeId ? "" : "hidden"}`}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="pl-1 text-xs text-stone-500">
                {tx("Email", "ईमेल")}
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={CLAY_INPUT}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="pl-1 text-xs text-stone-500">
                {tx("Password", "पासवर्ड")}
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`${CLAY_INPUT} pr-12`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={
                    showPw
                      ? tx("Hide password", "पासवर्ड छिपाएं")
                      : tx("Show password", "पासवर्ड दिखाएं")
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
                >
                  {showPw ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {/* Carry whatever they already typed, so they don't retype it. */}
              <Link
                to={`/auth/forgot-password${formData.email ? `?email=${encodeURIComponent(formData.email)}` : ""}`}
                className="inline-flex min-h-9 items-center pl-1 text-sm font-medium text-emerald-700 hover:underline"
              >
                {tx("Forgot password?", "पासवर्ड भूल गए?")}
              </Link>
            </div>

            <button type="submit" disabled={loading} className={CLAY_BUTTON}>
              {loading
                ? tx("Signing in…", "साइन इन हो रहा है…")
                : tx("Sign In", "साइन इन करें")}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {!challengeId && (
          <Button
            onClick={handleGoogleLogin}
            variant="ghost"
            className="mt-3 h-14 w-full rounded-2xl border border-stone-300/70 bg-white/50 text-[15px] font-semibold text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-white/80"
            disabled={loading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            {tx("Continue with Google", "Google से जारी रखें")}
          </Button>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-8 text-sm">
            <p className="text-stone-500">
              {tx("Don't have an account?", "खाता नहीं है?")}{" "}
              <button
                onClick={() =>
                  navigate(
                    "/auth/signup" +
                      (rawNext ? `?next=${encodeURIComponent(rawNext)}` : ""),
                  )
                }
                className="font-semibold text-stone-800 underline underline-offset-2"
              >
                {tx("Sign up", "साइन अप करें")}
              </button>
            </p>
            <Link
              to="/support"
              className="whitespace-nowrap text-stone-500 underline underline-offset-2 hover:text-stone-700"
            >
              {tx("Need help?", "मदद चाहिए?")}
            </Link>
          </div>
        </div>

        {/* ── Image panel ──────────────────────────────────────── */}
        <div className="relative m-3 h-48 overflow-hidden rounded-[2rem] shadow-[0_20px_45px_-15px_rgba(30,40,25,0.5)] md:h-auto">
          <BrandRipple />

          {/* Floating cards: real bhoomix moments, not filler. */}
          <div className="absolute left-4 top-4 hidden rounded-2xl bg-emerald-500/95 px-4 py-3 shadow-[0_10px_25px_-8px_rgba(6,78,59,0.7),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm md:block">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
              <ScanLine className="h-4 w-4" />
              {tx("Leaf scanned", "पत्ती स्कैन हुई")}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-50">
              {tx("Diagnosis in 4 seconds", "4 सेकंड में निदान")}
            </p>
          </div>

          <div
            className={`absolute right-4 top-16 hidden px-4 py-3 md:block ${CLAY_CARD}`}
          >
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              {tx("Wheat · Indore", "गेहूं · इंदौर")}
            </p>
            <p className="font-display text-xl font-bold text-stone-800">
              ₹2,826
              <span className="ml-1 text-[11px] font-medium text-stone-500">
                {tx("/ quintal", "/ क्विंटल")}
              </span>
            </p>
          </div>

          <div
            className={`absolute bottom-5 left-4 right-4 hidden px-4 py-3.5 md:block ${CLAY_CARD}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-stone-800">
                  {tx("Claim window open", "दावा विंडो खुली")}
                </p>
                <p className="text-[11px] text-stone-500">
                  {tx("48 hours left to report", "रिपोर्ट के लिए 48 घंटे बाकी")}
                </p>
              </div>
              <div className="flex -space-x-2">
                {["🌾", "🍅", "🌱"].map((c) => (
                  <span
                    key={c}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm shadow-[0_3px_8px_-2px_rgba(60,60,50,0.4)]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
