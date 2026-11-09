import { ActionForm, Submit } from "@/components/admin/ActionForm";
import { Check, Field, PageHead } from "@/components/admin/Fields";
import type { Brand, Category, Video } from "@/content/types";
import { getFreshContent, isLive } from "@/lib/content";
import { watchUrl } from "@/lib/youtube";
import { addVideo, deleteVideo, moveVideo, updateVideo } from "../../actions";

export const metadata = { title: "Videos" };

function BrandSelect({ brands, value }: { brands: Brand[]; value?: string }) {
  return (
    <select name="brandId" defaultValue={value ?? ""}>
      <option value="">No brand</option>
      {brands.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}

function GenreSelect({ categories, value, format }: { categories: Category[]; value?: string; format?: Video["format"] }) {
  return (
    <select name="category" defaultValue={value ?? categories[0]?.slug} required>
      {categories
        .filter((c) => !format || c.format === format)
        .map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.label} ({c.format === "long" ? "long form" : "vertical"})
          </option>
        ))}
    </select>
  );
}

export default async function VideosPage() {
  const { videos, categories, brands, settings } = await getFreshContent();
  const brandName = (id?: string) => brands.find((b) => b.id === id)?.name;

  return (
    <>
      <PageHead title="Videos">
        <span className="a-muted">{videos.length} on the site</span>
      </PageHead>

      <section className="a-card">
        <h2>Add a video</h2>
        <p className="a-muted a-lead">
          Paste any YouTube link. The title, upload date and thumbnail are filled in from YouTube. New videos go first in
          their genre.
        </p>
        <ActionForm action={addVideo} className="a-form" resetOnSuccess>
          <Field label="YouTube link" wide>
            <input name="url" required placeholder="https://youtube.com/shorts/… or https://youtu.be/…" inputMode="url" />
          </Field>
          <Field label="Genre">
            <GenreSelect categories={categories} />
          </Field>
          <Field label="Brand">
            <BrandSelect brands={brands} />
          </Field>
          <Field label="Title" hint="Leave empty to use the YouTube title.">
            <input name="title" maxLength={160} />
          </Field>
          <Field label="Views" hint="Only a verified figure, e.g. 1.2M+">
            <input name="views" maxLength={20} />
          </Field>
          <Field label="Views counted on">
            <input name="viewsSource" placeholder="Instagram" maxLength={40} />
          </Field>
          <div className="a-form__foot">
            <Check name="hero" label="Show in the hero wall (vertical only)" />
            <Submit>Add video</Submit>
          </div>
        </ActionForm>
      </section>

      {categories.map((category) => {
        const own = videos.filter((v) => v.category === category.slug);
        return (
          <section key={category.slug} className="a-card" id={category.slug}>
            <h2>
              {category.label}{" "}
              <span className={`a-pill${isLive(category, videos) ? " is-live" : ""}`}>
                {isLive(category, videos) ? "Live" : category.comingSoon ? "In the edit" : "No videos"}
              </span>
            </h2>
            {own.length === 0 && <p className="a-muted">No videos yet.</p>}
            <ol className="a-rows">
              {own.map((video, i) => (
                <li key={video.id} className="a-row">
                  <a href={watchUrl(video)} target="_blank" rel="noopener" className={`a-thumb a-thumb--${video.format}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview */}
                    <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} alt="" loading="lazy" />
                  </a>
                  <div className="a-row__body">
                    <b>{video.title}</b>
                    <span className="a-muted">
                      {[
                        brandName(video.brandId),
                        video.views && `${video.views} on ${video.viewsSource}`,
                        settings.heroWall.includes(video.id) && "Hero wall",
                        new Date(video.uploadDate).toLocaleDateString("en-IN"),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <details className="a-edit">
                      <summary>Edit</summary>
                      <ActionForm action={updateVideo} className="a-form">
                        <input type="hidden" name="id" value={video.id} />
                        <Field label="Title" wide>
                          <input name="title" defaultValue={video.title} required maxLength={160} />
                        </Field>
                        <Field label="Genre">
                          <GenreSelect categories={categories} value={video.category} format={video.format} />
                        </Field>
                        <Field label="Brand">
                          <BrandSelect brands={brands} value={video.brandId} />
                        </Field>
                        <Field label="Views">
                          <input name="views" defaultValue={video.views} maxLength={20} />
                        </Field>
                        <Field label="Views counted on">
                          <input name="viewsSource" defaultValue={video.viewsSource} placeholder="Instagram" maxLength={40} />
                        </Field>
                        <div className="a-form__foot">
                          {video.format === "short" && (
                            <Check name="hero" label="Show in the hero wall" defaultChecked={settings.heroWall.includes(video.id)} />
                          )}
                          <Submit>Save</Submit>
                        </div>
                      </ActionForm>
                    </details>
                  </div>
                  <div className="a-row__tools">
                    <ActionForm action={moveVideo} className="a-inline">
                      <input type="hidden" name="id" value={video.id} />
                      {i > 0 && (
                        <Submit variant="icon" name="dir" value="-1" title="Move up">
                          ↑
                        </Submit>
                      )}
                      {i < own.length - 1 && (
                        <Submit variant="icon" name="dir" value="1" title="Move down">
                          ↓
                        </Submit>
                      )}
                    </ActionForm>
                    <ActionForm action={deleteVideo} className="a-inline" confirm={`Remove “${video.title}” from the site?`}>
                      <input type="hidden" name="id" value={video.id} />
                      <Submit variant="danger">Remove</Submit>
                    </ActionForm>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </>
  );
}
