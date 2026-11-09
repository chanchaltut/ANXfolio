"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { login, type Result } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<Result, FormData>(login, null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Select the rejected password so typing replaces it. React's automatic form reset is
  // avoided, because it can wipe characters typed while the response is arriving.
  useEffect(() => {
    if (state && !state.ok) inputRef.current?.select();
  }, [state]);

  return (
    <form
      action={action}
      className="a-login__form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <label className="a-field">
        <span className="a-field__label">Password</span>
        <input ref={inputRef} name="password" type="password" required autoComplete="current-password" autoFocus />
      </label>
      {state && !state.ok && (
        <p className="a-note a-note--err" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" className="a-btn a-btn--primary a-btn--block" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
