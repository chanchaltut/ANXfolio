import { ActionForm, Submit } from "@/components/admin/ActionForm";
import { Check, Field, PageHead } from "@/components/admin/Fields";
import { getFreshContent } from "@/lib/content";
import { addTestimonial, deleteTestimonial, moveTestimonial, updateTestimonial } from "../../actions";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const { testimonials } = await getFreshContent();
  const published = testimonials.filter((t) => !t.placeholder).length;

  return (
    <>
      <PageHead title="Testimonials">
        <span className="a-muted">
          {published} published · drafts stay hidden. With none published, the site shows only the view-count receipts.
        </span>
      </PageHead>

      {testimonials.map((t, i) => (
        <section key={t.id} className={`a-card${t.placeholder ? " is-draft" : ""}`}>
          <div className="a-card__head">
            <h2>
              {t.author} <span className={`a-pill${t.placeholder ? "" : " is-live"}`}>{t.placeholder ? "Draft" : "Published"}</span>
            </h2>
            <div className="a-row__tools">
              <ActionForm action={moveTestimonial} className="a-inline">
                <input type="hidden" name="id" value={t.id} />
                {i > 0 && (
                  <Submit variant="icon" name="dir" value="-1" title="Move up">
                    ↑
                  </Submit>
                )}
                {i < testimonials.length - 1 && (
                  <Submit variant="icon" name="dir" value="1" title="Move down">
                    ↓
                  </Submit>
                )}
              </ActionForm>
              <ActionForm action={deleteTestimonial} className="a-inline" confirm="Delete this testimonial?">
                <input type="hidden" name="id" value={t.id} />
                <Submit variant="danger">Delete</Submit>
              </ActionForm>
            </div>
          </div>
          <TestimonialForm action={updateTestimonial} values={t} />
        </section>
      ))}

      <section className="a-card">
        <h2>Add a testimonial</h2>
        <p className="a-muted a-lead">Use the client&rsquo;s real words, with their permission. A specific result reads stronger than praise.</p>
        <TestimonialForm action={addTestimonial} />
      </section>
    </>
  );
}

function TestimonialForm({
  action,
  values,
}: {
  action: typeof addTestimonial;
  values?: { id: string; quote: string; author: string; role: string; placeholder?: boolean };
}) {
  return (
    <ActionForm action={action} className="a-form" resetOnSuccess={!values}>
      {values && <input type="hidden" name="id" value={values.id} />}
      <Field label="Quote" wide>
        <textarea name="quote" defaultValue={values?.quote} rows={3} required maxLength={800} />
      </Field>
      <Field label="Name">
        <input name="author" defaultValue={values?.author} required maxLength={80} />
      </Field>
      <Field label="Role and brand" hint="e.g. Marketing Lead, American Tourister">
        <input name="role" defaultValue={values?.role} maxLength={120} />
      </Field>
      <div className="a-form__foot">
        <Check name="draft" label="Draft (hidden on the site)" defaultChecked={values?.placeholder} />
        <Submit>{values ? "Save" : "Add testimonial"}</Submit>
      </div>
    </ActionForm>
  );
}
