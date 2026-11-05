/** @format */

import { notFound } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { StatusForm } from "@/components/admin/status-form";
import { formatAnswer, getQuestions } from "@/lib/brief-questions";
import {
  budgetLabels,
  projectTypeLabels,
  timelineLabels,
  type BriefStatus,
  type BudgetRange,
  type ProjectType,
  type Timeline,
} from "@/lib/validations/brief";

// شكل الصف الكامل في جدول briefs
type BriefRow = {
  id: string;
  created_at: string;
  status: BriefStatus;
  client_name: string;
  client_email: string;
  company: string | null;
  project_type: ProjectType;
  description: string;
  details: Record<string, string>;
  reference_sites: string[];
  budget_range: BudgetRange;
  timeline: Timeline;
  notes: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Africa/Casablanca",
});

// قسم بعنوان
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card brutal-border p-5">
      <h2 className="text-base">{title}</h2>
      <dl className="mt-3 divide-y-2 divide-border">{children}</dl>
    </section>
  );
}

// صف: عنوان + قيمة
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3">
      <dt className="font-mono text-xs uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="whitespace-pre-wrap break-words sm:col-span-2">
        {children || "—"}
      </dd>
    </div>
  );
}

// ديناميكي: params + كوكيز + قاعدة البيانات ← داخل Suspense
export async function BriefDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // رابط مثل /admin/briefs/abc ليس uuid - لا داعي لسؤال قاعدة البيانات
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", id)
    .maybeSingle(); // صف واحد أو null، بدل مصفوفة

  if (error) {
    console.error("Failed to load brief:", error);
    return (
      <p
        role="alert"
        className="mt-6 border-2 border-destructive bg-destructive/10 p-4 text-destructive">
        Could not load this brief. Check the server logs.
      </p>
    );
  }

  // غير موجود، أو RLS منعت القراءة - في الحالتين: 404
  if (!data) notFound();

  const brief = data as BriefRow;
  const questions = getQuestions(brief.project_type);

  return (
    <div className="mt-6 space-y-6">
      {/* الرأس: الاسم + الحالة + زر الرد */}
      <div className="bg-card brutal-border brutal-shadow p-5">
        <p className="font-mono text-xs uppercase text-muted-foreground">
          <time dateTime={brief.created_at}>
            {dateFormatter.format(new Date(brief.created_at))}
          </time>
        </p>
        <h1 className="mt-2 text-3xl">{brief.client_name}</h1>

        <div className="mt-6">
          <p className="mb-2 font-heading text-sm font-bold uppercase">
            Status
          </p>
          <StatusForm briefId={brief.id} currentStatus={brief.status} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {/* يفتح نافذة كتابة في Gmail على الويب مباشرة */}
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(brief.client_email)}&su=${encodeURIComponent("Re: your project brief")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent text-accent-foreground brutal-border px-4 py-2 font-heading text-sm font-bold uppercase">
            Reply in Gmail
          </a>

          {/* احتياطي: برنامج البريد الافتراضي في الجهاز */}
          <a
            href={`mailto:${brief.client_email}?subject=${encodeURIComponent("Re: your project brief")}`}
            className="inline-block bg-background brutal-border px-4 py-2 font-heading text-sm font-bold uppercase">
            Email app
          </a>
        </div>
      </div>

      <Section title="Client">
        <Row label="Name">{brief.client_name}</Row>
        <Row label="Email">{brief.client_email}</Row>
        <Row label="Company">{brief.company}</Row>
      </Section>

      <Section title="Project">
        <Row label="Type">{projectTypeLabels[brief.project_type].label}</Row>
        <Row label="Description">{brief.description}</Row>
      </Section>

      <Section title="Details">
        {questions.map((question) => (
          <Row key={question.key} label={question.label}>
            {formatAnswer(question, brief.details[question.key])}
          </Row>
        ))}
        <Row label="References">
          {brief.reference_sites.length > 0 && (
            <ul className="space-y-1">
              {brief.reference_sites.map((url) => (
                <li key={url}>
                  {/* nofollow: روابط من مستخدمين، لا نوصي بها لمحركات البحث
                      noopener noreferrer: الصفحة الخارجية لا تصل لصفحتنا */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline underline-offset-4 hover:text-accent">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Row>
      </Section>

      <Section title="Budget & timeline">
        <Row label="Budget">{budgetLabels[brief.budget_range]}</Row>
        <Row label="Timeline">{timelineLabels[brief.timeline]}</Row>
        <Row label="Notes">{brief.notes}</Row>
      </Section>
    </div>
  );
}
