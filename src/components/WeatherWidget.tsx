import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  MapPin,
  Wind,
  Sun,
  CloudFog,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/hooks/useWeather";

/** Map OpenWeatherMap icon codes to lucide glyphs. Exported for reuse. */
export function WeatherIcon({ icon, className = "h-8 w-8" }: { icon: string; className?: string }) {
  const prefix = icon?.startsWith("0") ? icon : "";
  if (prefix === "01") return <Sun className={`${className} text-yellow-400`} />;
  if (prefix === "02" || prefix === "03" || prefix === "04")
    return <Cloud className={`${className} text-sky-300`} />;
  if (icon?.startsWith("09") || icon?.startsWith("10"))
    return <CloudRain className={`${className} text-blue-300`} />;
  if (icon?.startsWith("11")) return <CloudLightning className={`${className} text-amber-400`} />;
  if (icon?.startsWith("13")) return <CloudSnow className={`${className} text-slate-200`} />;
  if (icon?.startsWith("50")) return <CloudFog className={`${className} text-gray-300`} />;
  return <Cloud className={`${className} text-sky-300`} />;
}

const WeatherWidget = () => {
  const { language } = useLanguage();
  const { weather, loading } = useWeather();

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6 flex items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          {language === "hi" ? "मौसम लोड हो रहा है…" : "Loading weather…"}
        </span>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-xl font-bold text-foreground">{weather.city}</h3>
        </div>
        <WeatherIcon icon={weather.conditionIcon} />
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-5xl font-bold text-foreground mb-1">{weather.temperature}°C</div>
          <p className="text-sm text-muted-foreground">
            {language === "hi"
              ? `महसूस होता है ${weather.feelsLike}°C`
              : `Feels like ${weather.feelsLike}°C`}
          </p>
        </div>
        <p className="text-sm font-medium text-foreground text-right">{weather.condition}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">
              {language === "hi" ? "आर्द्रता" : "Humidity"}
            </p>
            <p className="text-sm font-semibold text-foreground">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">
              {language === "hi" ? "हवा की गति" : "Wind Speed"}
            </p>
            <p className="text-sm font-semibold text-foreground">{weather.windSpeed} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
