import { ActionForm, Submit } from "@/components/admin/ActionForm";
import { Check, Field, PageHead } from "@/components/admin/Fields";
import type { PricingTier } from "@/content/types";
import { getFreshContent } from "@/lib/content";
import { addTier, deleteTier, moveTier, updateTier } from "../../actions";

export const metadata = { title: "Pricing" };

export default async function PricingPage() {
  const { pricing } = await getFreshContent();

  return (
    <>
      <PageHead title="Pricing">
        <span className="a-muted">Every “Get a quote” button preselects its plan in the contact form.</span>
      </PageHead>

      {pricing.map((tier, i) => (
        <section key={tier.id} className="a-card">
          <div className="a-card__head">
            <h2>
              {tier.name} {tier.highlighted && <span className="a-pill is-live">Highlighted</span>}
            </h2>
            <div className="a-row__tools">
              <ActionForm action={moveTier} className="a-inline">
                <input type="hidden" name="id" value={tier.id} />
                {i > 0 && (
                  <Submit variant="icon" name="dir" value="-1" title="Move left">
                    ←
                  </Submit>
                )}
                {i < pricing.length - 1 && (
                  <Submit variant="icon" name="dir" value="1" title="Move right">
                    →
                  </Submit>
                )}
              </ActionForm>
              <ActionForm action={deleteTier} className="a-inline" confirm={`Delete the ${tier.name} plan?`}>
                <input type="hidden" name="id" value={tier.id} />
                <Submit variant="danger">Delete</Submit>
              </ActionForm>
            </div>
          </div>
          <TierForm action={updateTier} values={tier} />
        </section>
      ))}

      <section className="a-card">
        <h2>Add a plan</h2>
        <TierForm action={addTier} />
      </section>
    </>
  );
}

function TierForm({ action, values }: { action: typeof addTier; values?: PricingTier }) {
  return (
    <ActionForm action={action} className="a-form" resetOnSuccess={!values}>
      {values && <input type="hidden" name="id" value={values.id} />}
      <Field label="Plan name">
        <input name="name" defaultValue={values?.name} required maxLength={60} />
      </Field>
      <Field label="Price" hint="e.g. ₹4,999 per reel, or Quote on brief">
        <input name="price" defaultValue={values?.price} maxLength={60} placeholder="Quote on brief" />
      </Field>
      <Field label="One-line summary" wide>
        <input name="summary" defaultValue={values?.summary} maxLength={160} />
      </Field>
      <Field label="What's included" hint="One item per line." wide>
        <textarea name="features" defaultValue={values?.features.join("\n")} rows={4} maxLength={2000} />
      </Field>
      <Field label="Badge on a highlighted plan">
        <input name="badge" defaultValue={values?.badge} maxLength={40} placeholder="Recommended" />
      </Field>
      <div className="a-form__foot">
        <Check name="highlighted" label="Highlight this plan" defaultChecked={values?.highlighted} />
        <Submit>{values ? "Save" : "Add plan"}</Submit>
      </div>
    </ActionForm>
  );
}
