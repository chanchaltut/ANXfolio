"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { submitBrief, type BriefState } from "@/app/actions/brief";
import { Arrow } from "./Icons";

/**
 * Posts the brief to the server, which saves it to the admin inbox and emails it when mail is
 * configured. Only if neither works does it open the visitor's mail app with the brief filled in.
 */
export function ContactForm({
  email,
  projectTypes,
  plans,
  fallback,
}: {
  email: string;
  projectTypes: string[];
  plans: string[];
  fallback: { label: string; href: string } | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState("");
  const [state, action, pending] = useActionState<BriefState, FormData>(submitBrief, { status: "idle" });

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.<HTMLElement>("[data-plan]");
      if (link?.dataset.plan) setPlan(link.dataset.plan);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (state.status === "sent") {
      formRef.current?.reset();
      setPlan("");
    }
    if (state.status === "fallback" && formRef.current) openMailApp(formRef.current, state.email || email);
  }, [state, email]);

  const fieldError = (name: string) =>
    state.status === "error" ? state.fields?.[name as keyof NonNullable<typeof state.fields>] : undefined;

  const field = (name: string) => ({
    name,
    "aria-invalid": fieldError(name) ? true : undefined,
    "aria-describedby": fieldError(name) ? `${name}-error` : undefined,
  });

  const errorText = (name: string) =>
    fieldError(name) ? (
      <em className="field__error" id={`${name}-error`}>
        {fieldError(name)}
      </em>
    ) : null;

  return (
    <form
      className="form"
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        // Submitting manually keeps what the visitor typed if the server asks for a fix.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      {/* Spam traps: a field people never see, and the time the form was opened. */}
      <input className="form__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="started" ref={startedRef} />

      <label className="field">
        <span>Your name</span>
        <input {...field("name")} required autoComplete="name" maxLength={120} />
        {errorText("name")}
      </label>
      <label className="field">
        <span>Email</span>
        <input {...field("email")} type="email" required autoComplete="email" maxLength={200} />
        {errorText("email")}
      </label>
      <label className="field">
        <span>Brand or channel</span>
        <input name="brand" autoComplete="organization" maxLength={160} />
      </label>
      <label className="field">
        <span>Type of video</span>
        <select name="type" defaultValue={projectTypes[0]}>
          {projectTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
          <option>Something else</option>
        </select>
      </label>
      <label className="field">
        <span>Plan</span>
        <select name="plan" value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">Not sure yet</option>
          {plans.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Footage or reference link</span>
        <input {...field("link")} type="url" placeholder="https://" maxLength={500} />
        {errorText("link")}
      </label>
      <label className="field field--wide">
        <span>The brief</span>
        <textarea
          {...field("message")}
          rows={4}
          required
          minLength={10}
          maxLength={5000}
          placeholder="What are you making, and by when?"
        />
        {errorText("message")}
      </label>
      <div className="form__foot">
        <button type="submit" className={`btn btn--cyan btn--lg${pending ? " is-busy" : ""}`} disabled={pending}>
          {pending ? "Sending…" : "Send the brief"} <Arrow />
        </button>
        <p className={`form__status form__status--${state.status}`} role="status" aria-live="polite">
          {state.status === "sent" && "Brief received. I'll reply to your email soon."}
          {state.status === "fallback" && "Your mail app should now be open with the brief filled in."}
          {state.status === "error" && (
            <>
              {state.message}
              {!state.fields && fallback && (
                <>
                  {" "}
                  <a href={fallback.href} target="_blank" rel="noopener">
                    {fallback.label}
                  </a>
                </>
              )}
            </>
          )}
        </p>
      </div>
    </form>
  );
}

function openMailApp(form: HTMLFormElement, to: string) {
  const data = new FormData(form);
  const body = [
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Brand: ${data.get("brand") || "-"}`,
    `Project: ${data.get("type")}`,
    `Plan: ${data.get("plan") || "-"}`,
    `Footage or references: ${data.get("link") || "-"}`,
    "",
    String(data.get("message") ?? ""),
  ].join("\n");
  const subject = `New brief: ${data.get("brand") || data.get("name")}`;
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
