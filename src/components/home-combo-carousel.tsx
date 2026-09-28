"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/menu/types";
import { ProductGrid } from "@/components/menu/product-grid";
import "./home-combo-carousel.css";

const ADVANCE_EVERY_MS = 4200;
const RESUME_AFTER_INTERACTION_MS = 8000;

/** Preserves the administrator's order; scrolls one card at a time without cloning items. */
export function HomeComboCarousel({
  combos,
  autoPlay = true,
}: {
  combos: Product[];
  autoPlay?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const resumeAt = useRef(0);
  const hovering = useRef(false);
  const focused = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || paused || combos.length < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden || hovering.current || focused.current ||
        Date.now() < resumeAt.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rail = railRef.current?.querySelector<HTMLElement>(".product-grid");
      if (!rail || rail.scrollWidth - rail.clientWidth < 8) return;
      const cards = rail.querySelectorAll<HTMLElement>(".product-card");
      const stride = cards.length > 1
        ? cards[1].offsetLeft - cards[0].offsetLeft
        : cards[0]?.getBoundingClientRect().width ?? 0;
      if (!stride) return;
      const max = rail.scrollWidth - rail.clientWidth;
      if (rail.scrollLeft >= max - 4) {
        rail.scrollTo({ left: 0, behavior: "auto" });
      } else {
        rail.scrollTo({ left: Math.min(rail.scrollLeft + stride, max), behavior: "smooth" });
      }
    }, ADVANCE_EVERY_MS);
    return () => window.clearInterval(id);
  }, [autoPlay, combos.length, paused]);

  function delayAutoPlay() {
    resumeAt.current = Date.now() + RESUME_AFTER_INTERACTION_MS;
  }

  return (
    <div
      className="home-combo-carousel"
      role="region"
      aria-roledescription="карусель"
      aria-label="Комбо DIYOR BURGER"
      ref={railRef}
      onMouseEnter={() => { hovering.current = true; }}
      onMouseLeave={() => { hovering.current = false; delayAutoPlay(); }}
      onPointerDown={delayAutoPlay}
      onTouchStart={delayAutoPlay}
      onWheel={delayAutoPlay}
      onKeyDown={delayAutoPlay}
      onFocusCapture={() => { focused.current = true; }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          focused.current = false;
          delayAutoPlay();
        }
      }}
    >
      <ProductGrid products={combos} />
      {autoPlay && combos.length > 1 && (
        <button
          type="button"
          className="home-combo-autoplay"
          aria-pressed={paused}
          aria-label={paused ? "Включить автоматическую прокрутку комбо" : "Остановить автоматическую прокрутку комбо"}
          onClick={() => { delayAutoPlay(); setPaused(value => !value); }}
        >{paused ? "▶ Автопрокрутка" : "Ⅱ Пауза"}</button>
      )}
    </div>
  );
}
