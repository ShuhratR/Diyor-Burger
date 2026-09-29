"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/menu/types";
import { ProductGrid } from "@/components/menu/product-grid";
import "./home-combo-carousel.css";

const ADVANCE_EVERY_MS = 2500;
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
  const ignoreRestoredFocus = useRef(false);
  const ignoreHoverUntilExit = useRef(false);
  const [paused, setPaused] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  function onQuickViewChange(open: boolean) {
    if (open) {
      setQuickViewOpen(true);
      return;
    }
    // The dialog restores focus to its opener on unmount. That restored
    // focus must not leave autoplay paused forever.
    ignoreRestoredFocus.current = true;
    ignoreHoverUntilExit.current = true;
    focused.current = false;
    hovering.current = false;
    resumeAt.current = 0;
    setQuickViewOpen(false);
  }

  useEffect(() => {
    if (!autoPlay || paused || quickViewOpen || combos.length < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden || hovering.current || focused.current ||
        Date.now() < resumeAt.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rail = railRef.current?.querySelector<HTMLElement>(".product-grid");
      if (!rail || rail.scrollWidth - rail.clientWidth < 8) return;
      const bounds = rail.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
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
  }, [autoPlay, combos.length, paused, quickViewOpen]);

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
      onMouseEnter={() => { if (!ignoreHoverUntilExit.current) hovering.current = true; }}
      onMouseLeave={() => {
        const wasIgnoring = ignoreHoverUntilExit.current;
        ignoreHoverUntilExit.current = false;
        hovering.current = false;
        if (!wasIgnoring && !quickViewOpen) delayAutoPlay();
      }}
      onPointerDown={delayAutoPlay}
      onTouchStart={delayAutoPlay}
      onWheel={delayAutoPlay}
      onKeyDown={delayAutoPlay}
      onFocusCapture={() => {
        if (ignoreRestoredFocus.current) {
          ignoreRestoredFocus.current = false;
          focused.current = false;
        } else {
          focused.current = true;
        }
      }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          focused.current = false;
          if (!ignoreRestoredFocus.current && !quickViewOpen) delayAutoPlay();
        }
      }}
    >
      <ProductGrid products={combos} onQuickViewChange={onQuickViewChange} />
      {autoPlay && combos.length > 1 && (
        <button
          type="button"
          className="home-combo-autoplay"
          aria-pressed={paused}
          aria-label={paused ? "Включить автоматическую прокрутку комбо" : "Остановить автоматическую прокрутку комбо"}
          onClick={event => {
            const nextPaused = !paused;
            setPaused(nextPaused);
            event.currentTarget.blur();
            resumeAt.current = nextPaused ? Date.now() + RESUME_AFTER_INTERACTION_MS : 0;
          }}
        >{paused ? "▶ Автопрокрутка" : "Ⅱ Пауза"}</button>
      )}
    </div>
  );
}
