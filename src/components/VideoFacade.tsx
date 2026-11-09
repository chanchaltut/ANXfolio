"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import type { Video } from "@/content/types";
import { announcePlay, PLAY_EVENT } from "@/lib/motion";
import { IMAGE_QUALITY } from "@/lib/images";
import { embedUrl, thumbnailUrl, watchUrl } from "@/lib/youtube";

/**
 * Shows a thumbnail and only creates the YouTube iframe when someone presses play,
 * so the page ships no player code. It is a real link, so it still works without
 * JavaScript and crawlers can follow it.
 */
export function VideoFacade({
  video,
  sizes,
  label,
  inert = false,
}: {
  video: Video;
  sizes: string;
  label?: string;
  /** Used for decorative slides in the long-form carousel. */
  inert?: boolean;
}) {
  const instance = useId();
  const [playing, setPlaying] = useState(false);
  const title = label ?? video.title;

  useEffect(() => {
    const onPlay = (e: Event) => {
      if ((e as CustomEvent<string | null>).detail !== instance) setPlaying(false);
    };
    window.addEventListener(PLAY_EVENT, onPlay);
    return () => window.removeEventListener(PLAY_EVENT, onPlay);
  }, [instance]);

  return (
    <div className={`vf vf--${video.format}`}>
      {playing ? (
        <iframe
          src={embedUrl(video.id, true)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <a
          href={watchUrl(video)}
          target="_blank"
          rel="noopener"
          className="vf__link"
          aria-label={`Play ${title}`}
          tabIndex={inert ? -1 : undefined}
          data-cursor={inert ? undefined : "Play"}
          onClick={(e) => {
            e.preventDefault();
            if (inert) return;
            announcePlay(instance);
            setPlaying(true);
          }}
        >
          <Image
            src={thumbnailUrl(video)}
            alt=""
            fill
            sizes={sizes}
            quality={IMAGE_QUALITY.content}
            className="vf__img"
            draggable={false}
          />
          <span className="vf__scrim" />
          <span className="vf__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        </a>
      )}
    </div>
  );
}
