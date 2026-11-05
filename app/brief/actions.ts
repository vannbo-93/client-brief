/** @format */

"use server";

import { after } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { briefSchema } from "@/lib/validations/brief";
import { cleanDetails, validateDetails } from "@/lib/brief-questions";
import { notifyNewBrief } from "@/lib/email/notify-new-brief";

// النتيجة التي ترجع للنموذج: نجاح، أو فشل مع رسالة للعميل
export type SubmitBriefResult = { ok: true } | { ok: false; error: string };

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

  // 2. التحقق من أسئلة Details حسب نوع المشروع
  const detailErrors = validateDetails(data.project_type, data.details);
  if (Object.keys(detailErrors).length > 0) {
    return {
      ok: false,
      error: "Please answer all the questions in the Details step.",
    };
  }

  // فقط إجابات أسئلة النوع المختار - نستخدمها في الحفظ والبريد
  const details = cleanDetails(data.project_type, data.details);

  // 3. الحفظ - أسماء الحقول تطابق أعمدة الجدول
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
    // التفاصيل التقنية في سجل السيرفر فقط، لا تُرسل للعميل
    console.error("Failed to save brief:", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again in a moment.",
    };
  }

  // 4. إشعار البريد - يُنفَّذ بعد إرسال الرد للعميل
  // العميل يرى شاشة الشكر فوراً، والبريد يُرسل في الخلفية
  after(() => notifyNewBrief(data, details));

  return { ok: true };
}
