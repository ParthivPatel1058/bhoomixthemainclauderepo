import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Check, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandRipple from "@/components/BrandRipple";
import BhoomixMark from "@/components/BhoomixMark";

/** How long the launch animation plays before the route actually changes. */
const LAUNCH_MS = 650;

/* Clay surfaces, matched to the login page so the two screens feel like one
   product. Every surface pairs an inset top highlight with a drop shadow cast
   from the same top-left light — that agreement is what reads as soft clay
   rather than a flat drop-shadow theme. */
const CLAY_BADGE =
  "shadow-[0_8px_20px_-6px_rgba(60,60,50,0.35),inset_0_1px_0_rgba(255,255,255,0.95)]";

const CLAY_PRIMARY =
  "flex h-14 w-full items-center justify-center gap-2 rounded-2xl " +
  "bg-gradient-to-b from-emerald-500 to-emerald-700 text-[15px] font-semibold text-white " +
  "shadow-[0_12px_24px_-8px_rgba(6,95,70,0.65),inset_0_2px_0_rgba(255,255,255,0.3)] " +
  "transition-transform active:translate-y-0.5 disabled:opacity-70";

export default function Welcome() {
  const navigate = useNavigate();
  const { language, setLanguage, tx } = useLanguage();
  const [launching, setLaunching] = useState(false);

  const handleGetStarted = () => {
    if (launching) return;
    setLaunching(true);
    window.setTimeout(() => navigate("/auth/signup"), LAUNCH_MS);
  };

  const points = [
    tx("Free crop disease scanning", "मुफ़्त फसल रोग जांच"),
    tx("Available in 23 Indian languages", "23 भारतीय भाषाओं में उपलब्ध"),
    tx("No credit card required", "क्रेडिट कार्ड की ज़रूरत नहीं"),
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#9fa6b0] via-[#aeb3ba] to-[#c2c6cb] p-4 sm:p-8">
      <div className="absolute right-6 top-6 z-10">
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className={`flex items-center gap-2 rounded-full bg-white/85 px-4 py-2.5 text-sm font-semibold text-stone-700 backdrop-blur transition-transform hover:scale-105 ${CLAY_BADGE}`}
        >
          <Globe className="h-4 w-4 text-emerald-600" />
          {tx("हिंदी", "English")}
        </button>
      </div>

      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#f6f6f3] via-[#f2f4ec] to-[#e4efd6] shadow-[0_45px_90px_-25px_rgba(30,40,25,0.55)] md:grid-cols-2">
        {/* ── Mosaic panel ─────────────────────────────────────── */}
        <div className="relative m-3 h-52 overflow-hidden rounded-[2rem] shadow-[0_20px_45px_-15px_rgba(30,40,25,0.5)] md:h-auto">
          <BrandRipple />

          {/* One lockup rather than a separate mark and wordmark: two badges
              side by side read as two logos, and the small square one turned
              into a dark blob against the mosaic. A soft halo lifts the pill
              off the tiles wherever they happen to be light. */}
          <div className="absolute left-5 top-5">
            <span
              aria-hidden="true"
              className="absolute -inset-3 rounded-full bg-white/45 blur-xl"
            />
            <span className="relative flex items-center gap-2.5 rounded-full bg-white/80 px-4 py-2.5 ring-1 ring-white/70 backdrop-blur-md shadow-[0_10px_28px_-8px_rgba(20,45,20,0.55),inset_0_1px_0_rgba(255,255,255,1)]">
              <BhoomixMark size={22} className="text-emerald-600" />
              <span className="font-display text-[15px] font-bold tracking-tight text-stone-800">
                bhoomix
              </span>
            </span>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        <div className="flex flex-col justify-center gap-7 p-8 sm:p-11">
          <div>
            <h1 className="font-display text-[clamp(1.5rem,4.5vw,2.5rem)] font-semibold leading-[1.15] text-stone-800 [overflow-wrap:anywhere]">
              {tx("Sign in to continue", "जारी रखने के लिए साइन इन करें")}
            </h1>
            <p className="mt-2 text-stone-500">
              {tx("Your farming companion", "आपका खेती साथी")}
            </p>
          </div>

          <ul className="space-y-2.5">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 text-[15px] text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_-6px_rgba(60,60,50,0.3)]"
              >
                <span
                  className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 ${CLAY_BADGE}`}
                >
                  <Check className="h-4 w-4 text-white" />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <button
              onClick={handleGetStarted}
              disabled={launching}
              className={CLAY_PRIMARY}
            >
              {launching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tx("Opening…", "खोल रहे हैं…")}
                </>
              ) : (
                <>
                  {tx("Get Started", "शुरू करें")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/auth/login")}
              className="w-full py-1 text-center text-sm text-stone-500 transition-colors hover:text-stone-800"
            >
              {tx("Already have an account? ", "पहले से खाता है? ")}
              <span className="font-semibold text-stone-800 underline underline-offset-2">
                {tx("Sign in", "साइन इन करें")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
