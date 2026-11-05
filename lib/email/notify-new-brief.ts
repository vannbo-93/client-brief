/** @format */

import "server-only";
import { Resend } from "resend";

import { formatAnswer, getQuestions } from "@/lib/brief-questions";
import {
  budgetLabels,
  projectTypeLabels,
  timelineLabels,
  type BriefInput,
} from "@/lib/validations/brief";

// نص البريد: سطر لكل إجابة، بنصوص مفهومة لا قيم تقنية
function buildEmailText(
  data: BriefInput,
  details: Record<string, string>,
): string {
  const detailLines = getQuestions(data.project_type)
    .map((question) => {
      const answer = formatAnswer(question, details[question.key]);
      return answer ? `${question.label}\n${answer}` : null;
    })
    .filter(Boolean)
    .join("\n\n");

  return [
    "NEW PROJECT BRIEF",
    "=================",
    "",
    `Name: ${data.client_name}`,
    `Email: ${data.client_email}`,
    `Company: ${data.company || "—"}`,
    "",
    `Type: ${projectTypeLabels[data.project_type].label}`,
    `Budget: ${budgetLabels[data.budget_range]}`,
    `Timeline: ${timelineLabels[data.timeline]}`,
    "",
    "DESCRIPTION",
    "-----------",
    data.description,
    "",
    "DETAILS",
    "-------",
    detailLines || "—",
    "",
    "REFERENCES",
    "----------",
    data.reference_sites.join("\n") || "—",
    "",
    "NOTES",
    "-----",
    data.notes || "—",
    "",
    "Reply to this email to answer the client directly.",
  ].join("\n");
}

// يرسل إشعاراً لك بطلب جديد
// لا يرمي خطأ أبداً: فشل البريد يجب ألا يُفشل حفظ الطلب
export async function notifyNewBrief(
  data: BriefInput,
  details: Record<string, string>,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    console.warn(
      "Brief notification skipped: RESEND_API_KEY or NOTIFY_EMAIL is missing",
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      // العنوان التجريبي - يُستبدل بدومينك عند توثيقه
      from: "Client Brief <onboarding@resend.dev>",
      to: notifyEmail,
      // "رد" في بريدك يذهب مباشرة للعميل
      replyTo: data.client_email,
      subject: `New brief: ${data.client_name} · ${projectTypeLabels[data.project_type].label} · ${budgetLabels[data.budget_range]}`,
      text: buildEmailText(data, details),
    });

    if (error) {
      console.error("Brief notification failed:", error);
    }
  } catch (error) {
    // أخطاء الشبكة وغيرها
    console.error("Brief notification failed:", error);
  }
}
