"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chevron } from "./Icons";

/** Native scroll-snap slider, so swipe and trackpad work with no carousel library. */
export function ReelSlider({ count, label, children }: { count: number; label: string; children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".vcard");
    if (!track || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    setIndex(Math.round(track.scrollLeft / step));
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    sync();
    track.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [sync]);

  const move = (dir: number) => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".vcard");
    if (!track || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    track.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="slider">
      <div className="slider__controls">
        <span className="slider__count" aria-hidden="true">
          {pad(Math.min(index + 1, count))} / {pad(count)}
        </span>
        <button type="button" className="round" aria-label={`Previous ${label} video`} disabled={index === 0} onClick={() => move(-1)}>
          <Chevron left />
        </button>
        <button type="button" className="round" aria-label={`Next ${label} video`} disabled={atEnd} onClick={() => move(1)}>
          <Chevron />
        </button>
      </div>
      <div className="slider__track" ref={trackRef} role="group" aria-label={`${label} videos`} tabIndex={0}>
        {children}
      </div>
    </div>
  );
}
