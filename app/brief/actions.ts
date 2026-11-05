/** @format */

"use server";

import { after } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { briefSchema } from "@/lib/validations/brief";
import { cleanDetails, validateDetails } from "@/lib/brief-questions";
import { notifyNewBrief } from "@/lib/email/notify-new-brief";

// النتيجة التي ترجع للنموذج: نجاح، أو فشل مع رسالة للعميل
export type SubmitBriefResult = { ok: true } | { ok: false; error: string };

// رسائل حد الطلبات - المفتاح هو hint من trigger قاعدة البيانات
const RATE_LIMIT_MESSAGES: Record<string, string> = {
  rate_limit_email:
    "You've already sent a few briefs today. I'll reply to those first. If something changed, just reply to my email.",
  rate_limit_global:
    "Too many requests right now. Please try again in an hour.",
};

// input من نوع unknown عمداً: أي شخص يستطيع استدعاء هذه الدالة
// مباشرة بأي بيانات، فلا نفترض أنها جاءت من نموذجنا
export async function submitBrief(input: unknown): Promise<SubmitBriefResult> {
  // 1. التحقق من الحقول الأساسية بنفس مخطط الواجهة
  const parsed = briefSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Some answers are invalid. Please review the form.",
    };
  }
  const data = parsed.data;

  // 2. فخ البوتات: إن امتلأ الحقل المخفي، نتظاهر بالنجاح دون حفظ
  // (لا نخبر البوت أنه كُشف، حتى لا يجرّب طريقة أخرى)
  if (data.fax) {
    console.warn("Honeypot triggered - brief ignored:", data.client_email);
    return { ok: true };
  }

  // 3. التحقق من أسئلة Details حسب نوع المشروع
  const detailErrors = validateDetails(data.project_type, data.details);
  if (Object.keys(detailErrors).length > 0) {
    return {
      ok: false,
      error: "Please answer all the questions in the Details step.",
    };
  }

  // فقط إجابات أسئلة النوع المختار - نستخدمها في الحفظ والبريد
  const details = cleanDetails(data.project_type, data.details);

  // 4. الحفظ - أسماء الحقول تطابق أعمدة الجدول (fax لا يُحفظ)
  const supabase = await createClient();
  const { error } = await supabase.from("briefs").insert({
    client_name: data.client_name,
    client_email: data.client_email,
    // الحقول الاختيارية الفارغة تُحفظ null لا ""
    company: data.company || null,
    project_type: data.project_type,
    description: data.description,
    details,
    reference_sites: data.reference_sites,
    budget_range: data.budget_range,
    timeline: data.timeline,
    notes: data.notes || null,
  });
  // ⚠️ لا نضيف .select() هنا: الزائر لا يملك صلاحية القراءة (RLS)

  if (error) {
    // حد الطلبات من trigger قاعدة البيانات: رسالة واضحة للعميل
    const rateLimitMessage = error.hint
      ? RATE_LIMIT_MESSAGES[error.hint]
      : undefined;
    if (rateLimitMessage) {
      console.warn("Brief rate limited:", error.hint, data.client_email);
      return { ok: false, error: rateLimitMessage };
    }

    // أي خطأ آخر: التفاصيل في سجل السيرفر فقط
    console.error("Failed to save brief:", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again in a moment.",
    };
  }

  // 5. إشعار البريد - يُنفَّذ بعد إرسال الرد للعميل
  after(() => notifyNewBrief(data, details));

  return { ok: true };
}
