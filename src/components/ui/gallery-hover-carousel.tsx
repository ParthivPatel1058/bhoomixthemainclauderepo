import Reveal from "@/components/Reveal";
import ShinyText from "@/components/ui/shiny-text";
import MagicBento, { type BentoItem } from "@/components/ui/magic-bento";

export type GalleryHoverCarouselItem = BentoItem;

interface GalleryHoverGridProps {
  heading?: string;
  subheading?: string;
  items: BentoItem[];
}

/**
 * Feature showcase. Sits on a blurred scrim so the type keeps contrast
 * wherever the fixed scene behind it happens to be bright, and lays the
 * features out as a Magic Bento grid.
 */
export default function GalleryHoverGrid({
  heading = "Everything you need",
  subheading = "From seed to sale — explore every tool in one place.",
  items,
}: GalleryHoverGridProps) {
  // The scrim panel that used to box this in has gone: it drew a grey
  // rectangle around the gallery and cropped it well short of the viewport,
  // so the cards read as the contents of a card rather than as the page. The
  // heading keeps its own contrast from the text shadows below, which is the
  // only thing the scrim was actually doing.
  return (
    <section className="w-full">
      <Reveal className="mb-8 max-w-2xl" blur distance={22}>
        <h2 className="page-title text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]">
          <ShinyText text={heading} speed={6} />
        </h2>
        <p className="mt-2 text-sm text-white/80 drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)] sm:text-base">{subheading}</p>
      </Reveal>

      <Reveal distance={34}>
        <MagicBento items={items} />
      </Reveal>
    </section>
  );
}
