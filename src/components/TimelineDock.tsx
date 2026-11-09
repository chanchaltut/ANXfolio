"use client";

import { useEffect, useRef, useState } from "react";
import { clamp01, subscribeScroll } from "@/lib/motion";

type Clip = { id: string; label: string; share: number };

/** The page is treated as a three-minute sequence at 24fps. */
const RUNTIME_SECONDS = 180;
const FPS = 24;
const NAV_HEIGHT = 72;

function timecode(progress: number) {
  const totalFrames = Math.round(progress * RUNTIME_SECONDS * FPS);
  const frames = totalFrames % FPS;
  const seconds = Math.floor(totalFrames / FPS) % 60;
  const minutes = Math.floor(totalFrames / FPS / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

/** Fixed edit-timeline: scroll position is the playhead, sections are clips you can jump to. */
export function TimelineDock() {
  const [clips, setClips] = useState<Clip[]>([]);
  const dockRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const clipsRef = useRef<Clip[]>([]);
  const topsRef = useRef<number[]>([]);
  // Read during measure only. Reading layout inside the scroll callback would force a reflow per frame.
  const layoutRef = useRef({ max: 1, clipLefts: [] as number[], clipWidths: [] as number[] });

  useEffect(() => {
    const measure = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-clip]"));
      const docH = document.documentElement.scrollHeight;
      const tops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
      const next = sections.map((s, i) => ({
        id: s.id,
        label: s.dataset.clip ?? "",
        share: ((tops[i + 1] ?? docH) - tops[i]) / docH,
      }));
      clipsRef.current = next;
      topsRef.current = tops;
      layoutRef.current.max = docH - window.innerHeight;
      setClips(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  // Clip geometry is read once the clips have rendered and whenever the dock is resized.
  useEffect(() => {
    const track = dockRef.current?.querySelector<HTMLElement>(".dock__track");
    if (!track) return;
    const read = () => {
      const els = Array.from(track.querySelectorAll<HTMLElement>(".dock__clip"));
      layoutRef.current.clipLefts = els.map((el) => el.offsetLeft);
      layoutRef.current.clipWidths = els.map((el) => el.offsetWidth);
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(track);
    return () => observer.disconnect();
  }, [clips]);

  useEffect(() => {
    let activeIndex = -1;
    let lastCode = "";
    let lastOn: boolean | null = null;
    return subscribeScroll((y, vh) => {
      const { max, clipLefts, clipWidths } = layoutRef.current;
      const code = timecode(clamp01(y / Math.max(max, 1)));
      if (code !== lastCode && tcRef.current) {
        lastCode = code;
        tcRef.current.textContent = code;
      }
      const on = y > vh * 0.4;
      if (on !== lastOn) {
        lastOn = on;
        dockRef.current?.classList.toggle("is-on", on);
      }

      // Clips keep a minimum width for their labels, so place the playhead within the active clip
      // instead of across the whole track. That keeps it aligned with the section on screen.
      const tops = topsRef.current;
      const probe = y + NAV_HEIGHT + 8;
      let index = 0;
      for (let i = 0; i < tops.length; i++) if (probe >= tops[i]) index = i;
      const start = tops[index] ?? 0;
      const end = tops[index + 1] ?? max + NAV_HEIGHT + 8;
      const within = clamp01((probe - start) / Math.max(end - start, 1));

      if (headRef.current && clipLefts[index] !== undefined) {
        const x = clipLefts[index] + within * clipWidths[index];
        headRef.current.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      if (index !== activeIndex) {
        activeIndex = index;
        dockRef.current
          ?.querySelectorAll(".dock__clip")
          .forEach((el, i) => el.classList.toggle("is-active", i === index));
      }
    });
  }, [clips]);

  return (
    <nav className="dock" ref={dockRef} aria-label="Page timeline">
      <span className="dock__tc" aria-hidden="true">
        <i className="dock__rec" />
        <span ref={tcRef}>00:00:00:00</span>
      </span>
      <div className="dock__track">
        {clips.map((clip, i) => (
          <a
            key={clip.id}
            href={`#${clip.id}`}
            className="dock__clip"
            data-tone={i % 3}
            style={{ flexGrow: clip.share }}
            aria-label={`Jump to ${clip.label}`}
          >
            <span>{clip.label}</span>
          </a>
        ))}
        <div className="dock__headwrap" ref={headRef} aria-hidden="true">
          <i className="dock__head" />
        </div>
      </div>
    </nav>
  );
}
