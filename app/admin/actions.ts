/** @format */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { statusValues } from "@/lib/validations/brief";

// =========================================================
// تسجيل الدخول والخروج
// =========================================================
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

// =========================================================
// تغيير حالة الطلب
// =========================================================
const updateStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(statusValues),
});

export type UpdateStatusResult = { ok: true } | { ok: false; error: string };

// unknown مرة أخرى: Server Action = رابط عام
export async function updateBriefStatus(
  id: unknown,
  status: unknown,
): Promise<UpdateStatusResult> {
  const parsed = updateStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { ok: false, error: "Invalid status." };
  }

  const supabase = await createClient();

  // RLS: فقط المدير يستطيع التعديل
  // grant update (status): فقط هذا العمود يمكن تعديله
  // .select("id") يرجع الصفوف المعدّلة، لنعرف هل حصل تعديل فعلاً
  const { data, error } = await supabase
    .from("briefs")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id");

  if (error) {
    console.error("Failed to update brief status:", error);
    return { ok: false, error: "Could not update the status. Try again." };
  }

  // RLS لا ترمي خطأ عند المنع، بل تعدّل صفر صفوف
  if (!data || data.length === 0) {
    return { ok: false, error: "Brief not found, or you don't have access." };
  }

  // تحديث القائمة وصفحة الطلب حتى تظهر الحالة الجديدة
  revalidatePath("/admin", "layout");
  return { ok: true };
}
