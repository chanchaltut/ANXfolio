"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navLinks } from "@/content/site";
import { Logo } from "./Logo";
import { Arrow } from "./Icons";

/** `base` is "" on the home page, so anchors stay in-page, and "/" on inner pages. */
export function Nav({ base = "" }: { base?: string }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`nav${solid || open ? " is-solid" : ""}`}>
      <div className="nav__inner">
        <Link href={base || "#top"} className="nav__logo" onClick={close} aria-label="ANX home">
          <Logo />
        </Link>

        <nav className={`nav__links${open ? " is-open" : ""}`} aria-label="Primary">
          {navLinks.map((link) => (
            <Link key={link.href} href={`${base}${link.href}`} onClick={close}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav__actions">
          <Link href={`${base}#contact`} className="btn btn--cyan" onClick={close}>
            Hire me <Arrow />
          </Link>
          <button
            type="button"
            className={`nav__toggle${open ? " is-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <i />
            <i />
          </button>
        </div>
      </div>
    </header>
  );
}
