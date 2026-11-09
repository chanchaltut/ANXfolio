/** Tiny scroll bus so everything shares one requestAnimationFrame loop. */
type Subscriber = (scrollY: number, viewportH: number) => void;

const subscribers = new Set<Subscriber>();

export function subscribeScroll(fn: Subscriber) {
  subscribers.add(fn);
  if (typeof window !== "undefined") fn(window.scrollY, window.innerHeight);
  return () => {
    subscribers.delete(fn);
  };
}

export function publishScroll(y: number, vh: number) {
  subscribers.forEach((fn) => fn(y, vh));
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const PLAY_EVENT = "anx:play";

/** Tells every player which video may keep running. Pass null to stop them all. */
export function announcePlay(instance: string | null) {
  window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: instance }));
}
