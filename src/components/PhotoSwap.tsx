"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { IMAGE_QUALITY } from "@/lib/images";

export type SwapPhoto = { src: StaticImageData; alt: string; position?: string };

const SIZES = "(max-width: 560px) 80vw, 470px";
/** Movement in px before a press counts as a drag rather than a tap. */
const DRAG_SLOP = 5;
/** Matches the slot transition in globals.css. */
const SWAP_MS = 750;

/**
 * Two photos in an editor's "picture in picture" layout. Drag the small one onto the big one,
 * or tap it, and they trade places. The big slot keeps the camera viewfinder.
 */
export function PhotoSwap({ photos }: { photos: [SwapPhoto, SwapPhoto] }) {
  const [big, setBig] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const bigEl = () => rootRef.current?.querySelector<HTMLElement>(".swap__photo.is-big") ?? null;

  const swap = (dragged?: HTMLElement) => {
    const root = rootRef.current;
    if (!root) return;
    // Clearing the drag offset in the same frame as the slot change lets the photo glide
    // from where it was dropped into the big frame.
    if (dragged) dragged.style.transform = "";
    bigEl()?.classList.remove("is-target");
    root.classList.add("is-swapping");
    window.setTimeout(() => root.classList.remove("is-swapping"), SWAP_MS);
    setBig((b) => 1 - b);
    setSwapped(true);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    press.current = { x: e.clientX, y: e.clientY, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.moved && Math.hypot(dx, dy) < DRAG_SLOP) return;
    if (!p.moved) {
      p.moved = true;
      e.currentTarget.classList.add("is-dragging");
    }
    e.currentTarget.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    const target = bigEl();
    if (target) {
      const r = target.getBoundingClientRect();
      const over = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      target.classList.toggle("is-target", over);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    const el = e.currentTarget;
    el.classList.remove("is-dragging");
    const target = bigEl();
    const dropped = target?.classList.contains("is-target");
    if (!p.moved || dropped) {
      swap(el);
    } else {
      el.style.transform = "";
    }
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    press.current = null;
    e.currentTarget.classList.remove("is-dragging");
    e.currentTarget.style.transform = "";
    bigEl()?.classList.remove("is-target");
  };

  return (
    <div className="swap" ref={rootRef}>
      {photos.map((photo, i) => {
        const isBig = i === big;
        return (
          <figure
            key={i}
            className={`swap__photo ${isBig ? "is-big" : "is-small"}`}
            {...(isBig
              ? {}
              : {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": "Swap the two photos",
                  onPointerDown,
                  onPointerMove,
                  onPointerUp,
                  onPointerCancel,
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      swap();
                    }
                  },
                })}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              placeholder="blur"
              sizes={SIZES}
              quality={IMAGE_QUALITY.photo}
              draggable={false}
              style={{ objectPosition: photo.position ?? "50% 50%" }}
            />
            {!isBig && !swapped && (
              <span className="swap__hint" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 4H4v11M4 4l16 16" />
                </svg>
                Drag to swap
              </span>
            )}
          </figure>
        );
      })}
      <span className="vfinder" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <b className="vfinder__rec">REC</b>
        <span className="vfinder__clip">A001_C00{big + 1}</span>
      </span>
    </div>
  );
}
