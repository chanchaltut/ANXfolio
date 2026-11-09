"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Video } from "@/content/types";
import { announcePlay } from "@/lib/motion";
import { thumbnailUrl } from "@/lib/youtube";
import { Chevron } from "./Icons";
import { VideoFacade } from "./VideoFacade";

/**
 * Centre video with dimmed neighbours and an ambient glow taken from the active frame.
 * With fewer than three videos the list repeats, so both sides stay filled.
 */
export function LongFormCarousel({ videos }: { videos: Video[] }) {
  const unique = videos.length;
  const slides = unique === 0 ? [] : unique < 3 ? [...videos, ...videos] : videos;
  const total = slides.length;
  const half = Math.floor(total / 2);
  const [active, setActive] = useState(0);
  const pointerStart = useRef<number | null>(null);

  const go = (dir: number) => {
    announcePlay(null);
    setActive((a) => (a + dir + total) % total);
  };

  const activeUnique = unique ? active % unique : 0;

  return (
    <div
      className="lf"
      onPointerDown={(e) => {
        pointerStart.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (pointerStart.current === null) return;
        const delta = e.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(delta) > 48) go(delta < 0 ? 1 : -1);
      }}
    >
      <div className="lf__ambient" aria-hidden="true">
        {videos.map((video, i) => (
          <Image
            key={video.id}
            src={thumbnailUrl(video)}
            alt=""
            fill
            sizes="64px"
            quality={55}
            className={i === activeUnique ? "is-active" : ""}
          />
        ))}
      </div>

      <div className="lf__stage">
        {slides.map((video, i) => {
          const offset = ((i - active + total + half) % total) - half;
          const isActive = offset === 0;
          return (
            <div
              key={`${video.id}-${i}`}
              className={`lf__slide${isActive ? " is-active" : ""}${Math.abs(offset) === 1 ? " is-side" : ""}`}
              style={{ "--o": offset } as React.CSSProperties}
              aria-hidden={!isActive}
            >
              <VideoFacade video={video} sizes="(max-width: 900px) 90vw, 960px" inert={!isActive} />
              {!isActive && Math.abs(offset) === 1 && (
                <button
                  type="button"
                  className="lf__sidehit"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => go(offset)}
                />
              )}
            </div>
          );
        })}
      </div>

      <button type="button" className="round lf__arrow lf__arrow--prev" aria-label="Previous long-form video" onClick={() => go(-1)}>
        <Chevron left />
      </button>
      <button type="button" className="round lf__arrow lf__arrow--next" aria-label="Next long-form video" onClick={() => go(1)}>
        <Chevron />
      </button>

      <p className="lf__caption wrap" aria-live="polite">
        <span className="lf__index">
          {String(activeUnique + 1).padStart(2, "0")} / {String(unique).padStart(2, "0")}
        </span>
        <span>{videos[activeUnique]?.title}</span>
      </p>
    </div>
  );
}
