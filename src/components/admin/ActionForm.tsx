"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, useState } from "react";
import type { Result } from "@/app/admin/actions";

type Action = (prev: Result, form: FormData) => Promise<Result>;

const PendingContext = createContext(false);
const TOAST_EVENT = "anx-admin:toast";

/**
 * Admin form with pending state and a toast for the result. Submits manually instead of through
 * the form action, so React does not reset the fields when the server asks for a correction.
 */
export function ActionForm({
  action,
  children,
  className,
  confirm,
  resetOnSuccess = false,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  /** Asks before submitting, for destructive actions. */
  confirm?: string;
  resetOnSuccess?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  // The toast fires as soon as the server answers. Waiting for an effect would lose it when the
  // response removes this form, as a delete does.
  const [, run, pending] = useActionState<Result, FormData>(async (prev, form) => {
    const result = await action(prev, form);
    if (result) window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: result }));
    if (result?.ok && resetOnSuccess) formRef.current?.reset();
    return result;
  }, null);

  return (
    <PendingContext.Provider value={pending}>
      <form
        ref={formRef}
        className={className}
        action={run}
        aria-busy={pending || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          if (confirm && !window.confirm(confirm)) return;
          const data = new FormData(e.currentTarget);
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          if (submitter?.name) data.set(submitter.name, submitter.value);
          startTransition(() => run(data));
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}

export function Submit({
  children,
  variant = "primary",
  name,
  value,
  title,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger" | "icon";
  name?: string;
  value?: string;
  title?: string;
}) {
  const pending = useContext(PendingContext);
  return (
    <button
      type="submit"
      className={`a-btn a-btn--${variant}`}
      disabled={pending}
      name={name}
      value={value}
      title={title}
      aria-label={variant === "icon" ? title : undefined}
    >
      {children}
    </button>
  );
}

type Toast = { id: number; ok: boolean; message: string };

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    let seq = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<NonNullable<Result>>).detail;
      const id = ++seq;
      setToasts((list) => [...list.slice(-2), { id, ok: detail.ok, message: detail.message }]);
      window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), detail.ok ? 3200 : 6500);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);
  return (
    <div className="a-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <p key={t.id} className={`a-toast ${t.ok ? "is-ok" : "is-err"}`}>
          {t.message}
        </p>
      ))}
    </div>
  );
}
