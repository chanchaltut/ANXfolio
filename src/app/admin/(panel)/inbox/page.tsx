import { ActionForm, Submit } from "@/components/admin/ActionForm";
import { PageHead } from "@/components/admin/Fields";
import { store } from "@/lib/store";
import { deleteBrief, setBriefRead } from "../../actions";

export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  let error = false;
  const briefs = await store.listBriefs().catch(() => {
    error = true;
    return [];
  });

  return (
    <>
      <PageHead title="Inbox">
        <span className="a-muted">{briefs.length} brief{briefs.length === 1 ? "" : "s"}</span>
      </PageHead>
      {error && <p className="a-note a-note--err">The inbox could not be loaded. Check the storage settings.</p>}
      {!error && briefs.length === 0 && (
        <section className="a-card">
          <p className="a-muted">No briefs yet. Anything sent through the contact form lands here.</p>
        </section>
      )}
      {briefs.map((b) => {
        const subject = encodeURIComponent(`Re: your ${b.type || "video"} brief`);
        return (
          <article key={b.id} id={b.id} className={`a-card a-brief${b.read ? "" : " is-unread"}`}>
            <header className="a-card__head">
              <h2>
                {b.brand || b.name} {!b.read && <span className="a-pill is-live">New</span>}
              </h2>
              <time className="a-muted" dateTime={b.createdAt}>
                {new Date(b.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </time>
            </header>
            <dl className="a-dl">
              <dt>From</dt>
              <dd>
                {b.name} · <a href={`mailto:${b.email}`}>{b.email}</a>
              </dd>
              <dt>Project</dt>
              <dd>
                {b.type || "-"}
                {b.plan && ` · ${b.plan}`}
              </dd>
              {b.link && (
                <>
                  <dt>Footage</dt>
                  <dd>
                    <a href={b.link} target="_blank" rel="noopener noreferrer nofollow">
                      {b.link}
                    </a>
                  </dd>
                </>
              )}
            </dl>
            <p className="a-brief__msg">{b.message}</p>
            <footer className="a-row__tools">
              <a className="a-btn a-btn--primary" href={`mailto:${b.email}?subject=${subject}`}>
                Reply
              </a>
              <ActionForm action={setBriefRead} className="a-inline">
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="read" value={b.read ? "false" : "true"} />
                <Submit variant="ghost">{b.read ? "Mark unread" : "Mark read"}</Submit>
              </ActionForm>
              <ActionForm action={deleteBrief} className="a-inline" confirm="Delete this brief?">
                <input type="hidden" name="id" value={b.id} />
                <Submit variant="danger">Delete</Submit>
              </ActionForm>
            </footer>
          </article>
        );
      })}
    </>
  );
}
