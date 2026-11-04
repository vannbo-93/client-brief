/** @format */

import { z } from "zod";

// =========================================================
// الخيارات الثابتة - يجب أن تطابق CHECK في supabase/schema.sql
// =========================================================

export const projectTypeValues = [
  "landing",
  "portfolio",
  "business",
  "ecommerce",
  "web_app",
  "other",
] as const;

export const budgetValues = [
  "under_300",
  "300_700",
  "700_1500",
  "1500_3000",
  "3500_plus",
  "not_sure",
] as const;

export const timelineValues = [
  "asap",
  "1_month",
  "2_3_months",
  "flexible",
] as const;

// الأنواع المستخرجة من القوائم: "landing" | "portfolio" | ...
export type ProjectType = (typeof projectTypeValues)[number];
export type BudgetRange = (typeof budgetValues)[number];
export type Timeline = (typeof timelineValues)[number];

// =========================================================
// النصوص التي تظهر للعميل في الواجهة
// Record يجبرك على كتابة نص لكل قيمة - إن نسيت واحدة يظهر خطأ TypeScript
// =========================================================

export const projectTypeLabels: Record<
  ProjectType,
  { label: string; hint: string }
> = {
  landing: {
    label: "Landing page",
    hint: "One page to promote a product, event, or service",
  },
  portfolio: {
    label: "Portfolio",
    hint: "Showcase your work: design, photography, writing...",
  },
  business: {
    label: "Business website",
    hint: "A few pages: about, services, contact",
  },
  ecommerce: {
    label: "Online store",
    hint: "Sell products with cart and checkout",
  },
  web_app: {
    label: "Web application",
    hint: "Accounts, dashboards, custom features",
  },
  other: { label: "Something else", hint: "Describe it in your own words" },
};

export const budgetLabels: Record<BudgetRange, string> = {
  under_300: "Under $300",
  "300_700": "$300 – $700",
  "700_1500": "$700 – $1,500",
  "1500_3000": "$1,500 – $3,000",
  "3500_plus": "$3500_plus",
  not_sure: "Not sure yet",
};

export const timelineLabels: Record<Timeline, string> = {
  asap: "As soon as possible",
  "1_month": "Within a month",
  "2_3_months": "2–3 months",
  flexible: "Flexible",
};

// =========================================================
// المخطط الرئيسي
// =========================================================

export const briefSchema = z.object({
  // --- الخطوة 1: معلومات العميل ---
  client_name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(100, "Name is too long"),

  // trim و toLowerCase قبل التحقق، لأن العملاء يلصقون البريد مع مسافات
  client_email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address").max(200, "Email is too long")),

  // اختياري: النموذج يرسل "" إن تُرك فارغاً، وسنحوّله إلى null في السيرفر
  company: z.string().trim().max(150, "Too long"),

  // --- الخطوة 2: نوع المشروع والوصف ---
  project_type: z.enum(projectTypeValues, { error: "Choose a project type" }),

  description: z
    .string()
    .trim()
    .min(20, "Tell me a bit more (at least 20 characters)")
    .max(5000, "Please keep it under 5000 characters"),

  // --- الخطوة 3: أسئلة حسب نوع المشروع (سنحددها بدقة في الجزء 4) ---
  details: z.record(z.string(), z.string().max(1000)),

  // روابط مواقع مرجعية - http و https فقط، و5 كحد أقصى
  reference_sites: z
    .array(
      z.url({
        protocol: /^https?$/,
        error: "Enter a full link starting with https://",
      }),
    )
    .max(5, "Up to 5 links"),

  // --- الخطوة 4: الميزانية والموعد ---
  budget_range: z.enum(budgetValues, { error: "Choose a budget range" }),
  timeline: z.enum(timelineValues, { error: "Choose a timeline" }),

  notes: z.string().trim().max(3000, "Please keep it under 3000 characters"),
});

// النوع الذي يستخدمه النموذج - يُستخرج تلقائياً من المخطط
export type BriefInput = z.infer<typeof briefSchema>;
// النوع قبل التحقق (ما يكتبه العميل في الحقول)
// BriefInput هو النوع بعد التحقق والتنظيف (ما يصل للسيرفر)
export type BriefFormValues = z.input<typeof briefSchema>;
