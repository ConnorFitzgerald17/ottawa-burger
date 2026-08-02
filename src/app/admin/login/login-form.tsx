"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form className="form-stack" action={action}>
      <input type="hidden" name="next" value={next}/>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required/></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required/></div>
      <button className="button button--ink" disabled={pending}>{pending ? "Checking the list…" : "Enter the test kitchen"}</button>
    </form>
  );
}
