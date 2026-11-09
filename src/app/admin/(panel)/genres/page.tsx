import { ActionForm, Submit } from "@/components/admin/ActionForm";
import { Check, Field, PageHead } from "@/components/admin/Fields";
import { getFreshContent, isLive } from "@/lib/content";
import { addGenre, deleteGenre, moveGenre, updateGenre } from "../../actions";

export const metadata = { title: "Genres" };

export default async function GenresPage() {
  const { categories, videos } = await getFreshContent();

  return (
    <>
      <PageHead title="Genres">
        <span className="a-muted">The order here is the order on the home page.</span>
      </PageHead>

      {categories.map((genre, i) => {
        const count = videos.filter((v) => v.category === genre.slug).length;
        const live = isLive(genre, videos);
        return (
          <section key={genre.slug} className="a-card">
            <div className="a-card__head">
              <h2>
                {genre.label} <span className={`a-pill${live ? " is-live" : ""}`}>{live ? "Live" : "In the edit"}</span>
              </h2>
              <div className="a-row__tools">
                {live && (
                  <a className="a-btn a-btn--ghost" href={`/work/${genre.slug}`} target="_blank" rel="noopener">
                    View ↗
                  </a>
                )}
                <ActionForm action={moveGenre} className="a-inline">
                  <input type="hidden" name="slug" value={genre.slug} />
                  {i > 0 && (
                    <Submit variant="icon" name="dir" value="-1" title="Move up">
                      ↑
                    </Submit>
                  )}
                  {i < categories.length - 1 && (
                    <Submit variant="icon" name="dir" value="1" title="Move down">
                      ↓
                    </Submit>
                  )}
                </ActionForm>
                {count === 0 && (
                  <ActionForm action={deleteGenre} className="a-inline" confirm={`Delete the ${genre.label} genre?`}>
                    <input type="hidden" name="slug" value={genre.slug} />
                    <Submit variant="danger">Delete</Submit>
                  </ActionForm>
                )}
              </div>
            </div>
            <p className="a-muted a-lead">
              {count} video{count === 1 ? "" : "s"} · {genre.format === "long" ? "Long form, shown in the carousel" : "Vertical reels"} ·{" "}
              /work/{genre.slug}
            </p>
            <ActionForm action={updateGenre} className="a-form">
              <input type="hidden" name="slug" value={genre.slug} />
              <Field label="Name">
                <input name="label" defaultValue={genre.label} required maxLength={60} />
              </Field>
              <Field label="Search title" hint="Shown in Google results. Around 50 characters.">
                <input name="seoTitle" defaultValue={genre.seoTitle} maxLength={70} />
              </Field>
              <Field label="Short description" wide>
                <input name="blurb" defaultValue={genre.blurb} maxLength={240} />
              </Field>
              <Field label="Search description" hint="Shown under the title in Google. Up to 160 characters." wide>
                <textarea name="seoDescription" defaultValue={genre.seoDescription} rows={2} maxLength={170} />
              </Field>
              <div className="a-form__foot">
                <Check name="live" label="Live on the site" defaultChecked={!genre.comingSoon} />
                <Submit>Save</Submit>
              </div>
            </ActionForm>
          </section>
        );
      })}

      <section className="a-card">
        <h2>Add a genre</h2>
        <ActionForm action={addGenre} className="a-form" resetOnSuccess>
          <Field label="Name">
            <input name="label" required maxLength={60} placeholder="e.g. Real Estate" />
          </Field>
          <Field label="Video shape">
            <select name="format" defaultValue="short">
              <option value="short">Vertical reels and shorts</option>
              <option value="long">Long form (16:9)</option>
            </select>
          </Field>
          <Field label="Short description" wide>
            <input name="blurb" maxLength={240} />
          </Field>
          <div className="a-form__foot">
            <span className="a-muted">New genres start as “In the edit”. Add videos, then set them live.</span>
            <Submit>Add genre</Submit>
          </div>
        </ActionForm>
      </section>
    </>
  );
}
