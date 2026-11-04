/** @format */

import type { ProjectType } from "@/lib/validations/brief";

// =========================================================
// شكل السؤال: نص قصير، أو نص طويل، أو اختيار من بطاقات
// =========================================================
type BaseQuestion = {
  key: string; // اسم الحقل داخل details في قاعدة البيانات
  label: string;
  hint?: string;
  required?: boolean;
};

export type DetailQuestion =
  | (BaseQuestion & { type: "text" | "textarea" })
  | (BaseQuestion & {
      type: "choice";
      options: { value: string; label: string }[];
    });

// خيارات تتكرر في أكثر من سؤال
const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

const CONTENT_READY: DetailQuestion = {
  key: "content_ready",
  label: "Are your texts and images ready?",
  type: "choice",
  required: true,
  options: [
    { value: "ready", label: "Ready" },
    { value: "partly", label: "Partly" },
    { value: "need_help", label: "I need help" },
  ],
};

// =========================================================
// أسئلة مشتركة: تظهر لكل الأنواع، بعد أسئلة النوع
// =========================================================
const COMMON_QUESTIONS: DetailQuestion[] = [
  {
    key: "has_branding",
    label: "Do you have a logo and brand colors?",
    type: "choice",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "has_domain",
    label: "Do you own a domain name?",
    hint: "For example: yourbrand.com",
    type: "choice",
    required: true,
    options: YES_NO_UNSURE,
  },
];

// =========================================================
// أسئلة كل نوع - Record يجبرك على تعريف كل الأنواع
// =========================================================
const QUESTIONS_BY_TYPE: Record<ProjectType, DetailQuestion[]> = {
  landing: [
    {
      key: "goal",
      label: "What is the main goal of the page?",
      hint: "Collect emails, sell one product, promote an event...",
      type: "text",
      required: true,
    },
    {
      key: "call_to_action",
      label: "What should visitors do?",
      type: "choice",
      required: true,
      options: [
        { value: "contact", label: "Contact me" },
        { value: "sign_up", label: "Sign up" },
        { value: "buy", label: "Buy" },
        { value: "book", label: "Book a call" },
      ],
    },
    CONTENT_READY,
  ],

  portfolio: [
    {
      key: "work_type",
      label: "What kind of work will you show?",
      hint: "Design, photography, writing, architecture...",
      type: "text",
      required: true,
    },
    {
      key: "project_count",
      label: "How many projects to start with?",
      type: "choice",
      required: true,
      options: [
        { value: "1_10", label: "1–10" },
        { value: "10_30", label: "10–30" },
        { value: "30_plus", label: "30+" },
      ],
    },
    CONTENT_READY,
  ],

  business: [
    {
      key: "pages",
      label: "Which pages do you need?",
      hint: "For example: Home, About, Services, Contact",
      type: "textarea",
      required: true,
    },
    CONTENT_READY,
  ],

  ecommerce: [
    {
      key: "product_count",
      label: "How many products?",
      type: "choice",
      required: true,
      options: [
        { value: "under_20", label: "Under 20" },
        { value: "20_100", label: "20–100" },
        { value: "100_plus", label: "100+" },
      ],
    },
    {
      key: "payments",
      label: "How will customers pay?",
      hint: "Card, PayPal, cash on delivery...",
      type: "text",
      required: true,
    },
    {
      key: "shipping",
      label: "Where do you sell?",
      type: "choice",
      required: true,
      options: [
        { value: "local", label: "One country" },
        { value: "international", label: "International" },
        { value: "digital", label: "Digital products" },
      ],
    },
  ],

  web_app: [
    {
      key: "users",
      label: "Who will use it?",
      hint: "Your customers, your team, both...",
      type: "text",
      required: true,
    },
    {
      key: "main_features",
      label: "List the main features",
      hint: "One per line",
      type: "textarea",
      required: true,
    },
    {
      key: "user_accounts",
      label: "Do users need accounts?",
      type: "choice",
      required: true,
      options: YES_NO_UNSURE,
    },
  ],

  // "Something else": الوصف في الخطوة 2 يكفي، فقط الأسئلة المشتركة
  other: [],
};

// =========================================================
// دوال مساعدة - تُستخدم في الواجهة الآن وفي السيرفر في المرحلة 4
// =========================================================

// كل الأسئلة لنوع معيّن: أسئلة النوع + المشتركة
export function getQuestions(type: ProjectType | undefined): DetailQuestion[] {
  if (!type) return [];
  return [...QUESTIONS_BY_TYPE[type], ...COMMON_QUESTIONS];
}

// يُرجع { key: "رسالة الخطأ" } لكل سؤال لم تتم الإجابة عليه بشكل صحيح
export function validateDetails(
  type: ProjectType | undefined,
  details: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of getQuestions(type)) {
    const value = details[question.key]?.trim() ?? "";

    if (question.required && !value) {
      errors[question.key] =
        question.type === "choice"
          ? "Choose one option"
          : "This field is required";
    } else if (
      question.type === "choice" &&
      value &&
      !question.options.some((option) => option.value === value)
    ) {
      // يحمي من قيم مُرسلة يدوياً لا توجد في الخيارات
      errors[question.key] = "Invalid option";
    }
  }

  return errors;
}

// يُبقي فقط إجابات أسئلة النوع الحالي
// (إن غيّر العميل النوع من متجر إلى بورتفوليو، تُحذف إجابات المتجر)
export function cleanDetails(
  type: ProjectType,
  details: Record<string, string>,
): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const question of getQuestions(type)) {
    const value = details[question.key]?.trim();
    if (value) clean[question.key] = value;
  }
  return clean;
}

// يحوّل القيمة التقنية إلى نص مفهوم: "under_20" ← "Under 20"
export function formatAnswer(
  question: DetailQuestion,
  value: string | undefined,
): string {
  if (!value) return "";
  if (question.type !== "choice") return value;
  return (
    question.options.find((option) => option.value === value)?.label ?? value
  );
}
