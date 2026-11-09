import Link from "next/link";
import { Toaster } from "@/components/admin/ActionForm";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/server/auth";
import { store, storageWarning } from "@/lib/store";
import { logout } from "../actions";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const unread = (await store.listBriefs().catch(() => [])).filter((b) => !b.read).length;

  return (
    <div className="a-shell">
      <aside className="a-side">
        <Link href="/admin" className="a-side__logo" aria-label="Admin home">
          <Logo />
          <span>Admin</span>
        </Link>
        <AdminNav unread={unread} />
        <div className="a-side__foot">
          <a href="/" target="_blank" rel="noopener" className="a-side__link">
            View site ↗
          </a>
          <form action={logout}>
            <button type="submit" className="a-side__link">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="a-main">
        {storageWarning && <p className="a-note a-note--warn a-banner">{storageWarning}</p>}
        {children}
      </main>
      <Toaster />
    </div>
  );
}
