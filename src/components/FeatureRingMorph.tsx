import { useLanguage } from '@/contexts/LanguageContext';
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useNavigate } from "react-router-dom";

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

export interface RingMorphItem {
  title: string;
  titleHi: string;
  img: string;
  href: string;
  cta: string;
  ctaHi: string;
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

interface FlipCardProps {
  item: RingMorphItem;
  index: number;
  en: boolean;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
  onSelect: () => void;
}

function FlipCard({ item, index, en, target, onSelect }: FlipCardProps) {
  const { tx } = useLanguage();
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="cursor-pointer group"
      onClick={onSelect}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-white/20 bg-white/5"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img src={item.img} alt={tx(item.title, item.titleHi)} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg gradient-primary flex flex-col items-center justify-center p-2 text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-[7px] font-bold text-white/80 uppercase tracking-widest mb-1">
            {tx(item.cta, item.ctaHi)}
          </p>
          <p className="text-[9px] font-semibold text-white leading-tight">
            {tx(item.title, item.titleHi)}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const MAX_SCROLL = 2400;
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

interface FeatureRingMorphProps {
  items: RingMorphItem[];
  en: boolean;
}

export default function FeatureRingMorph({ items, en }: FeatureRingMorphProps) {
  const { tx } = useLanguage();
  const navigate = useNavigate();
  const total = items.length;

  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Container size
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });
    return () => observer.disconnect();
  }, []);

  // Virtual scroll — releases at bounds so the page can scroll past the section
  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const consume = (delta: number) => {
      const cur = scrollRef.current;
      const atTop = cur <= 0 && delta < 0;
      const atEnd = cur >= MAX_SCROLL && delta > 0;
      if (atTop || atEnd) return false; // let the page take over
      const next = Math.min(Math.max(cur + delta, 0), MAX_SCROLL);
      scrollRef.current = next;
      virtualScroll.set(next);
      return true;
    };

    const handleWheel = (e: WheelEvent) => {
      if (consume(e.deltaY)) e.preventDefault();
    };
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;
      if (consume(deltaY)) e.preventDefault();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });
  const scrollRotate = useTransform(virtualScroll, [600, MAX_SCROLL], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 100);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // Intro sequence
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("line"), 500);
    const t2 = setTimeout(() => setIntroPhase("circle"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const scatterPositions = useMemo(
    () =>
      items.map(() => ({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      })),
    [items],
  );

  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);
  useEffect(() => {
    const a = smoothMorph.on("change", setMorphValue);
    const b = smoothScrollRotate.on("change", setRotateValue);
    const c = smoothMouseX.on("change", setParallaxValue);
    return () => { a(); b(); c(); };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[85vh] overflow-hidden rounded-[28px] border border-white/10">
      <div className="flex h-full w-full flex-col items-center justify-center">
        {/* Intro text (fades out as morph begins) */}
        <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={
              introPhase === "circle" && morphValue < 0.5
                ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                : { opacity: 0, filter: "blur(10px)" }
            }
            transition={{ duration: 1 }}
            className="font-display text-2xl md:text-4xl font-bold tracking-tight text-white"
          >
            {tx("Explore bhoomix", "bhoomix एक्सप्लोर करें")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.6 - morphValue } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-4 text-xs font-bold tracking-[0.2em] text-white/60"
          >
            {tx("SCROLL TO EXPLORE", "एक्सप्लोर करने के लिए स्क्रॉल करें")}
          </motion.p>
        </div>

        {/* Arc content (fades in when arc forms) */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute top-[8%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
        >
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-white tracking-tight mb-3">
            {tx("Everything you need", "आपकी हर ज़रूरत")}
          </h2>
          <p className="text-sm md:text-base text-white/70 max-w-lg leading-relaxed">
            {tx("From seed to sale — tap any card to explore that tool.", "बीज से बिक्री तक — किसी भी कार्ड पर टैप करके एक्सप्लोर करें।")}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="relative flex items-center justify-center w-full h-full">
          {items.map((item, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            if (introPhase === "scatter") {
              target = scatterPositions[i];
            } else if (introPhase === "line") {
              const lineSpacing = 70;
              const lineTotalWidth = total * lineSpacing;
              const lineX = i * lineSpacing - lineTotalWidth / 2;
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
            } else {
              const isMobile = containerSize.width < 768;
              const minDimension = Math.min(containerSize.width, containerSize.height);

              const circleRadius = Math.min(minDimension * 0.35, 320);
              const circleAngle = (i / total) * 360;
              const circleRad = (circleAngle * Math.PI) / 180;
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
              };

              const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
              const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
              const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
              const arcCenterY = arcApexY + arcRadius;
              const spreadAngle = isMobile ? 100 : 130;
              const startAngle = -90 - spreadAngle / 2;
              const step = spreadAngle / (total - 1);

              const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
              const maxRotation = spreadAngle * 0.8;
              const boundedRotation = -scrollProgress * maxRotation;

              const currentArcAngle = startAngle + i * step + boundedRotation;
              const arcRad = (currentArcAngle * Math.PI) / 180;
              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.4 : 1.8,
              };

              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(1, arcPos.scale, morphValue),
                opacity: 1,
              };
            }

            return (
              <FlipCard
                key={item.href + i}
                item={item}
                index={i}
                en={en}
                target={target}
                onSelect={() => navigate(item.href)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
