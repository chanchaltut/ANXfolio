import { ActionForm, Submit } from "@/components/admin/ActionForm";
import { Field, PageHead } from "@/components/admin/Fields";
import { site } from "@/content/site";
import { getFreshContent } from "@/lib/content";
import { mailConfigured } from "@/lib/server/mail";
import { store } from "@/lib/store";
import { importContent, updateSettings } from "../../actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { settings } = await getFreshContent();
  const s = settings.socials;

  return (
    <>
      <PageHead title="Settings" />

      <section className="a-card">
        <ActionForm action={updateSettings} className="a-form">
          <h2 className="a-form__title">Contact</h2>
          <Field label="Contact email" hint="Shown publicly on the site. New briefs are also emailed here when email delivery is set up.">
            <input name="email" type="email" defaultValue={settings.email} maxLength={200} placeholder="you@example.com" />
          </Field>
          <Field label="City" hint="Optional. Helps local search, e.g. Mumbai.">
            <input name="city" defaultValue={settings.city} maxLength={80} />
          </Field>

          <Field label="About you" hint="Shown next to your portrait. Write in first person. Leave a blank line between paragraphs." wide>
            <textarea name="about" defaultValue={settings.about} rows={5} maxLength={900} />
          </Field>

          <h2 className="a-form__title">Numbers</h2>
          <Field label="Total views" hint="Shown in the hero, stats and FAQ. Leave empty to hide.">
            <input name="totalViews" defaultValue={settings.totalViews} maxLength={20} />
          </Field>
          <Field label="Top video views">
            <input name="topVideoViews" defaultValue={settings.topVideoViews} maxLength={20} />
          </Field>
          <Field label="Top video caption" hint="Finishes the sentence “40M+ …”" wide>
            <input name="topVideoLabel" defaultValue={settings.topVideoLabel} maxLength={80} />
          </Field>

          <h2 className="a-form__title">Profiles</h2>
          <Field label="Instagram">
            <input name="instagram" type="url" defaultValue={s.instagram} placeholder="https://instagram.com/…" />
          </Field>
          <Field label="YouTube">
            <input name="youtube" type="url" defaultValue={s.youtube} />
          </Field>
          <Field label="LinkedIn">
            <input name="linkedin" type="url" defaultValue={s.linkedin} />
          </Field>
          <Field label="Behance">
            <input name="behance" type="url" defaultValue={s.behance} />
          </Field>
          <Field label="X">
            <input name="x" type="url" defaultValue={s.x} />
          </Field>
          <div className="a-form__foot">
            <span className="a-muted">Profiles appear in the footer and tell Google they are all the same person.</span>
            <Submit>Save settings</Submit>
          </div>
        </ActionForm>
      </section>

      <section className="a-card">
        <h2>Backup</h2>
        <p className="a-muted a-lead">
          Download everything (videos, genres, brands, copy and briefs) as one file. Restoring a backup replaces the site
          content but keeps the inbox. Use it to move content from your computer to the live site.
        </p>
        <div className="a-backup">
          <a className="a-btn a-btn--ghost" href="/admin/export">
            Download backup
          </a>
          <ActionForm
            action={importContent}
            className="a-inline"
            resetOnSuccess
            confirm="Replace all site content with this backup?"
          >
            <input name="backup" type="file" accept="application/json,.json" required />
            <Submit variant="ghost">Restore</Submit>
          </ActionForm>
        </div>
      </section>

      <section className="a-card">
        <h2>System</h2>
        <dl className="a-dl">
          <dt>Storage</dt>
          <dd>{store.name === "redis" ? "Upstash Redis" : "Files on this server (.data folder)"}</dd>
          <dt>Email delivery</dt>
          <dd>{mailConfigured() ? "Resend is connected" : "Off. Briefs are saved to the inbox only. Set RESEND_API_KEY to also email them."}</dd>
          <dt>Site address</dt>
          <dd>{site.url}</dd>
        </dl>
      </section>
    </>
  );
}
