"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { clamp01, publishScroll } from "@/lib/motion";
import type Lenis from "lenis";

type Parallax = { el: HTMLElement; speed: number; axis: "x" | "y"; center: number; live: boolean; offset: number };
type Scrub = { el: HTMLElement; top: number; height: number; hero: boolean; last: number };

/** Width of the N's diagonal stroke as a share of the logo width. Sets how far the hero must zoom. */
const LOGO_STROKE_RATIO = 0.07;
const HERO_ZOOM_END = 0.72;
/** Scrubbed text updates in small steps, so words are not restyled on every scroll pixel. */
const SCRUB_STEP = 0.004;

/**
 * Drives every scroll effect from one loop: reveals, parallax, scroll-scrubbed scenes,
 * count-ups and the play cursor. Writes transforms and CSS variables only, so nothing
 * triggers layout while scrolling.
 */
export function MotionEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const countEls = document.querySelectorAll<HTMLElement>("[data-count]");

    if (reduce) {
      revealEls.forEach((el) => el.classList.add("in"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countObserver.unobserve(entry.target);
          runCount(entry.target as HTMLElement);
        });
      },
      { threshold: 0.6 },
    );
    countEls.forEach((el) => countObserver.observe(el));

    // Decode images about a screen before they scroll in, so the first paint of a frame never
    // waits on decoding. That was the main source of dropped frames on a first scroll.
    const decodeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          decodeObserver.unobserve(entry.target);
          const img = entry.target as HTMLImageElement;
          if (img.loading === "lazy") img.loading = "eager";
          img.decode().catch(() => undefined);
        });
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    document
      .querySelectorAll<HTMLImageElement>("main img:not(.wall__tile img)")
      .forEach((img) => decodeObserver.observe(img));

    // Looping CSS animations still tick on the main thread offscreen, so pause them there.
    const loopObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-paused", !entry.isIntersecting));
    });
    document.querySelectorAll(".hero__stage,.marquee,.about").forEach((el) => loopObserver.observe(el));

    const parallax: Parallax[] = [];
    document.querySelectorAll<HTMLElement>("[data-speed],[data-drift]").forEach((el) => {
      const drift = el.dataset.drift;
      parallax.push({
        el,
        speed: Number(drift ?? el.dataset.speed),
        axis: drift !== undefined ? "x" : "y",
        center: 0,
        live: false,
        offset: 0,
      });
    });
    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = parallax.find((p) => p.el === entry.target);
          if (item) item.live = entry.isIntersecting;
        });
      },
      { rootMargin: "20% 0px" },
    );
    parallax.forEach((p) => parallaxObserver.observe(p.el));

    const scrubs: Scrub[] = Array.from(document.querySelectorAll<HTMLElement>("[data-scrub]")).map((el) => ({
      el,
      top: 0,
      height: 0,
      hero: el.dataset.scrub === "hero",
      last: -1,
    }));
    const iris = document.querySelector<SVGSVGElement>(".iris");
    // Only the layers that read the value get it, so scrolling never restyles the wall's tiles.
    const heroLayers = document.querySelectorAll<HTMLElement>(
      ".wall__col,.hero__shade,.hero__copy,.hero__end",
    );
    let irisMax = 40;

    let dirty = true;
    let lastY = -1;
    let vh = window.innerHeight;

    const measure = () => {
      vh = window.innerHeight;
      const y = window.scrollY;
      parallax.forEach((p) => {
        const r = p.el.getBoundingClientRect();
        const shift = p.axis === "y" ? p.offset : 0;
        p.center = r.top + y - shift + r.height / 2;
      });
      scrubs.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        s.top = r.top + y;
        s.height = r.height;
      });
      if (iris) {
        const strokePx = Math.max(iris.getBoundingClientRect().width / currentIrisScale, 1) * LOGO_STROKE_RATIO;
        irisMax = (Math.hypot(window.innerWidth, vh) * 1.5) / strokePx;
      }
      dirty = true;
    };

    let currentIrisScale = 1;

    const frame = (y: number) => {
      const mid = y + vh / 2;
      for (const p of parallax) {
        if (!p.live) continue;
        p.offset = (mid - p.center) * p.speed;
        p.el.style.transform =
          p.axis === "x" ? `translate3d(${p.offset.toFixed(1)}px,0,0)` : `translate3d(0,${p.offset.toFixed(1)}px,0)`;
      }
      for (const s of scrubs) {
        if (y < s.top - vh || y > s.top + s.height) continue;
        const p = clamp01((y - s.top) / Math.max(s.height - vh, 1));
        if (Math.abs(p - s.last) < (s.hero ? 0.0005 : SCRUB_STEP) && p > 0 && p < 1) continue;
        if (p === s.last) continue;
        s.last = p;
        if (!s.hero) {
          s.el.style.setProperty("--p", p.toFixed(4));
          continue;
        }
        const value = p.toFixed(4);
        heroLayers.forEach((layer) => layer.style.setProperty("--hp", value));
        if (iris) {
          const t = clamp01(p / HERO_ZOOM_END);
          currentIrisScale = Math.exp(t * t * Math.log(irisMax));
          iris.style.transform = `scale(${currentIrisScale.toFixed(3)})`;
          iris.style.visibility = t >= 1 ? "hidden" : "visible";
          iris.classList.toggle("is-moving", t > 0);
        }
      }
      publishScroll(y, vh);
    };

    // Smooth wheel scrolling. Loaded after paint so it never blocks the first render.
    let lenis: Lenis | null = null;
    let cancelled = false;
    import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      // Anchor offset comes from the CSS scroll-margin on sections, which Lenis already respects.
      lenis = new LenisCtor({ lerp: 0.11, anchors: true });
    });

    // Play cursor
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cursor = document.querySelector<HTMLElement>(".cursor");
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let cursorOn = false;

    const onPointer = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = (e.target as Element | null)?.closest?.<HTMLElement>("[data-cursor]");
      if (!cursor) return;
      const label = target?.dataset.cursor;
      if (label) {
        if (cursor.textContent !== label) cursor.textContent = label;
        if (!cursorOn) {
          cx = tx;
          cy = ty;
          cursor.classList.add("on");
          cursorOn = true;
        }
      } else if (cursorOn) {
        cursor.classList.remove("on");
        cursorOn = false;
      }
    };
    if (finePointer && cursor) window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      const y = window.scrollY;
      if (dirty || y !== lastY) {
        lastY = y;
        dirty = false;
        frame(y);
      }
      if (cursorOn && cursor) {
        cx += (tx - cx) * 0.2;
        cy += (ty - cy) * 0.2;
        cursor.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) translate(-50%,-50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    measure();
    raf = requestAnimationFrame(loop);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", measure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      revealObserver.disconnect();
      countObserver.disconnect();
      parallaxObserver.disconnect();
      loopObserver.disconnect();
      decodeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}

function runCount(el: HTMLElement) {
  const original = el.textContent ?? "";
  // Counts plain figures such as "45M+" or "1.2M+". Anything else, like "1,200", is left as typed.
  const match = original.match(/^(\d+(?:\.\d+)?)(\D*)$/);
  if (!match) return;
  const target = Number(match[1]);
  const decimals = match[1].split(".")[1]?.length ?? 0;
  const suffix = match[2];
  const start = performance.now();
  const duration = 1300;
  const tick = (now: number) => {
    const t = clamp01((now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = t < 1 ? `${(target * eased).toFixed(decimals)}${suffix}` : original;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
