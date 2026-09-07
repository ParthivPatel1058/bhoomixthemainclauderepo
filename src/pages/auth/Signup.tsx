import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button3D from "@/components/ui/button-3d";
import BrandRipple from "@/components/BrandRipple";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, User, ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import { isDisposableEmail } from "@/lib/email-policy";

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

export default function Signup() {
  const navigate = useNavigate();
  const { tx } = useLanguage();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get("next") ?? "";
  const nextPath =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = signupSchema.parse(formData);

      // Caught here only to give a clear message; sign-in re-checks this
      // server-side, so a bypass at this step buys an attacker nothing.
      if (isDisposableEmail(validated.email)) {
        toast.error(
          tx(
            "Use a permanent email address. Temporary inboxes are not accepted.",
            "स्थायी ईमेल पता इस्तेमाल करें। अस्थायी इनबॉक्स स्वीकार नहीं हैं।",
          ),
        );
        return;
      }

      setLoading(true);

      const redirectUrl = `${window.location.origin}${nextPath}`;

      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { username: validated.username, full_name: validated.username },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error(
            tx(
              "This email is already registered. Please sign in instead.",
              "यह ईमेल पहले से पंजीकृत है। कृपया साइन इन करें।",
            ),
          );
        } else if (/Database error saving new user/i.test(error.message)) {
          // `profiles.username` is UNIQUE, and the trigger that creates the
          // row runs inside the signup transaction. A taken name therefore
          // surfaces as an opaque 500 from the auth API rather than as a
          // validation error, so it has to be translated here.
          toast.error(
            tx(
              "That username is already taken. Try another one.",
              "यह उपयोगकर्ता नाम पहले से लिया जा चुका है। दूसरा आज़माएं।",
            ),
          );
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(
          tx("Account created! Redirecting…", "खाता बन गया! ले जा रहे हैं…"),
        );
        if (nextPath === "/") navigate("/");
        else window.location.href = nextPath;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(
          tx("An error occurred during signup", "साइन अप करते समय समस्या हुई"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:grid-cols-2">
        {/* Positioned so the WebGL canvas has a box to fill; the ripple is
            absolutely placed inside it. */}
        <div className="relative h-40 w-full overflow-hidden md:h-auto">
          <BrandRipple />
        </div>

        <div className="p-8 sm:p-10">
          <button
            onClick={() => navigate("/auth/welcome")}
            aria-label={tx("Back", "वापस")}
            className="mb-6 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="mb-7">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {tx("Create an account", "खाता बनाएं")}
            </h1>
            <p className="mt-1.5 text-muted-foreground">
              {tx("Join bhoomix today", "आज ही bhoomix से जुड़ें")}
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">
                {tx("Username", "उपयोगकर्ता नाम")}
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder={tx("your name", "आपका नाम")}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="h-12 pl-11"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{tx("Email", "ईमेल")}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-12 pl-11"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{tx("Password", "पासवर्ड")}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-12 pl-11"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button3D
              type="submit"
              tone="emerald"
              disabled={loading}
              className="!mt-7"
            >
              {loading
                ? tx("Creating account…", "खाता बन रहा है…")
                : tx("Register", "पंजीकरण करें")}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button3D>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">
              {tx("or", "या")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            onClick={handleGoogleSignup}
            variant="outline"
            className="h-12 w-full text-base font-semibold"
            disabled={loading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            {tx("Continue with Google", "Google से जारी रखें")}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {tx("Already have an account?", "पहले से खाता है?")}{" "}
            <button
              onClick={() =>
                navigate(
                  "/auth/login" +
                    (rawNext ? `?next=${encodeURIComponent(rawNext)}` : ""),
                )
              }
              className="font-semibold text-primary hover:underline"
            >
              {tx("Sign in", "साइन इन करें")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
