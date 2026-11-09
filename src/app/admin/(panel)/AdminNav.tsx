"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/genres", label: "Genres" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <nav className="a-nav" aria-label="Admin">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? path === "/admin" : path.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
            {link.label}
            {link.href === "/admin/inbox" && unread > 0 && <b className="a-badge">{unread}</b>}
          </Link>
        );
      })}
    </nav>
  );
}
