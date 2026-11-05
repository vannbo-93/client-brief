/** @format */

import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin | Client Brief",
  // لا نريد صفحة الدخول في نتائج Google
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card brutal-border brutal-shadow p-8">
        <span className="inline-block bg-accent text-accent-foreground brutal-border-thin px-3 py-1 font-mono text-xs uppercase">
          Admin
        </span>
        <h1 className="mt-4 mb-8 text-3xl">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
