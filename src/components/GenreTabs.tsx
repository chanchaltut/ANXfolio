"use client";

import { Children, useEffect, useRef, useState } from "react";

type Tab = { slug: string; label: string; count: number };

/**
 * One work section with a tab per genre, instead of a full-height reel per genre.
 * Every panel is in the HTML (inactive ones are `hidden`), so crawlers and AI readers still see
 * every genre and video. A link to #<genre-slug> opens that tab.
 */
export function GenreTabs({
  tabs,
  upcoming,
  children,
}: {
  tabs: Tab[];
  upcoming: string[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panels = Children.toArray(children);

  // Open the genre named in the URL hash, on load and when an in-page link changes it.
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const index = tabs.findIndex((t) => t.slug === slug);
      if (index < 0) return;
      setActive(index);
      requestAnimationFrame(() => document.getElementById("work")?.scrollIntoView({ block: "start" }));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  // Keep the active tab in view when the tab row scrolls sideways on phones.
  useEffect(() => {
    const row = rowRef.current;
    const tab = listRef.current?.children[active] as HTMLElement | undefined;
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    const left = tab.offsetLeft - row.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
    row.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const focusTab = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setActive(next);
    (listRef.current?.children[next] as HTMLElement | undefined)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    focusTab(keys[e.key]);
  };

  return (
    <div className="gtabs">
      <div className="gtabs__bar wrap" ref={rowRef}>
        <div className="gtabs__list" role="tablist" aria-label="Genres" ref={listRef} onKeyDown={onKeyDown}>
          {tabs.map((tab, i) => (
            <button
              key={tab.slug}
              type="button"
              role="tab"
              id={`tab-${tab.slug}`}
              aria-selected={i === active}
              aria-controls={`panel-${tab.slug}`}
              tabIndex={i === active ? 0 : -1}
              className="gtabs__tab"
              onClick={() => setActive(i)}
            >
              {tab.label}
              <span className="gtabs__count">{String(tab.count).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
        {upcoming.map((label) => (
          <span key={label} className="gtabs__tab gtabs__tab--soon">
            {label}
            <span className="gtabs__soon">Soon</span>
          </span>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={tabs[i]?.slug ?? i}
          role="tabpanel"
          id={`panel-${tabs[i]?.slug}`}
          aria-labelledby={`tab-${tabs[i]?.slug}`}
          className="gtabs__panel"
          hidden={i !== active}
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
