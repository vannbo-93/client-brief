/** @format */

"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/brief/form-field";
import { login, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  // state: آخر نتيجة من login
  // formAction: نمرره لـ <form action>
  // isPending: true أثناء انتظار السيرفر
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormField id="email" label="Email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </FormField>

      <FormField id="password" label="Password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>

      {state.error && (
        <p
          role="alert"
          className="border-2 border-destructive bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        variant="accent"
        disabled={isPending}
        className="w-full">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
