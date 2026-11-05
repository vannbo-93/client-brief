/** @format */

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
});

export type LoginState = { error: string | null };

// useActionState يمرر الحالة السابقة أولاً ثم بيانات النموذج
export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.warn("Admin login failed:", parsed.data.email, error.message);
    // رسالة واحدة للخطأين: لا نكشف هل البريد موجود أم لا
    return { error: "Wrong email or password." };
  }

  // redirect يرمي "خطأ" خاصاً يفهمه Next.js، فيجب أن يكون خارج try/catch
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
