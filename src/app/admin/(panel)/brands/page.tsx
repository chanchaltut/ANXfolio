import { ActionForm, Submit } from "@/components/admin/ActionForm";
import { Check, Field, PageHead } from "@/components/admin/Fields";
import { BrandMark } from "@/components/BrandMark";
import { getFreshContent } from "@/lib/content";
import { addBrand, deleteBrand, moveBrand, updateBrand } from "../../actions";

export const metadata = { title: "Brands" };

export default async function BrandsPage() {
  const { brands, videos } = await getFreshContent();

  return (
    <>
      <PageHead title="Brands">
        <span className="a-muted">Shown in the scrolling “Cut for” strip and on video cards.</span>
      </PageHead>

      <section className="a-card">
        <p className="a-muted a-lead">
          Upload logos as SVG (best) or PNG, under 300 KB. They are shown in white, so a single-colour logo on a transparent
          background works best.
        </p>
        <ol className="a-rows">
          {brands.map((brand, i) => {
            const used = videos.filter((v) => v.brandId === brand.id).length;
            return (
              <li key={brand.id} className="a-row">
                <div className="a-logo">
                  <BrandMark brand={brand} />
                </div>
                <div className="a-row__body">
                  <b>{brand.name}</b>
                  <span className="a-muted">
                    {used} video{used === 1 ? "" : "s"} · {brand.logo ? "Logo" : "Typed name, no logo yet"}
                  </span>
                  <details className="a-edit">
                    <summary>Edit</summary>
                    <ActionForm action={updateBrand} className="a-form" resetOnSuccess>
                      <input type="hidden" name="id" value={brand.id} />
                      <Field label="Name">
                        <input name="name" defaultValue={brand.name} required maxLength={80} />
                      </Field>
                      <Field label={brand.logo ? "Replace logo" : "Logo"}>
                        <input name="logo" type="file" accept=".svg,.png,image/svg+xml,image/png" />
                      </Field>
                      <div className="a-form__foot">
                        {brand.logo && <Check name="removeLogo" label="Remove the logo and show the name" />}
                        <Submit>Save</Submit>
                      </div>
                    </ActionForm>
                  </details>
                </div>
                <div className="a-row__tools">
                  <ActionForm action={moveBrand} className="a-inline">
                    <input type="hidden" name="id" value={brand.id} />
                    {i > 0 && (
                      <Submit variant="icon" name="dir" value="-1" title="Move up">
                        ↑
                      </Submit>
                    )}
                    {i < brands.length - 1 && (
                      <Submit variant="icon" name="dir" value="1" title="Move down">
                        ↓
                      </Submit>
                    )}
                  </ActionForm>
                  {used === 0 && (
                    <ActionForm action={deleteBrand} className="a-inline" confirm={`Delete ${brand.name}?`}>
                      <input type="hidden" name="id" value={brand.id} />
                      <Submit variant="danger">Delete</Submit>
                    </ActionForm>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="a-card">
        <h2>Add a brand</h2>
        <ActionForm action={addBrand} className="a-form" resetOnSuccess>
          <Field label="Name">
            <input name="name" required maxLength={80} />
          </Field>
          <Field label="Logo" hint="Optional. SVG or PNG.">
            <input name="logo" type="file" accept=".svg,.png,image/svg+xml,image/png" />
          </Field>
          <div className="a-form__foot">
            <span />
            <Submit>Add brand</Submit>
          </div>
        </ActionForm>
      </section>
    </>
  );
}
