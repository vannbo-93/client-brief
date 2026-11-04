/** @format */

"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  budgetLabels,
  projectTypeLabels,
  timelineLabels,
  type BriefFormValues,
} from "@/lib/validations/brief";
import { formatAnswer, getQuestions } from "@/lib/brief-questions";

type StepReviewProps = {
  onEdit: (stepIndex: number) => void; // ينقل العميل إلى خطوة معينة
};

// صف واحد: العنوان يساراً والقيمة يميناً
function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3">
      <dt className="font-mono text-xs uppercase text-muted-foreground">
        {label}
      </dt>
      {/* whitespace-pre-wrap يحافظ على الأسطر الجديدة في النص
          break-words يمنع الروابط الطويلة من كسر التصميم */}
      <dd className="whitespace-pre-wrap break-words sm:col-span-2">
        {value || "—"}
      </dd>
    </div>
  );
}

// قسم: عنوان + زر Edit + الصفوف
function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-2 border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base">{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <dl className="mt-2 divide-y-2 divide-border">{children}</dl>
    </section>
  );
}

export function StepReview({ onEdit }: StepReviewProps) {
  // getValues يقرأ القيم مرة واحدة - يكفي لأن العميل لا يعدّل شيئاً في هذه الخطوة
  const values = useFormContext<BriefFormValues>().getValues();

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Check your answers. You can go back and edit any section.
      </p>

      <Section title="About you" onEdit={() => onEdit(0)}>
        <Row label="Name" value={values.client_name} />
        <Row label="Email" value={values.client_email} />
        <Row label="Company" value={values.company} />
      </Section>

      <Section title="Your project" onEdit={() => onEdit(1)}>
        <Row
          label="Type"
          value={projectTypeLabels[values.project_type]?.label}
        />
        <Row label="Description" value={values.description} />
      </Section>

      <Section title="Details" onEdit={() => onEdit(2)}>
        {/* نعرض فقط أسئلة النوع الحالي، بنصوص مفهومة */}
        {getQuestions(values.project_type).map((question) => (
          <Row
            key={question.key}
            label={question.label}
            value={formatAnswer(question, values.details[question.key])}
          />
        ))}
        <Row label="References" value={values.reference_sites.join("\n")} />
      </Section>

      <Section title="Budget & timeline" onEdit={() => onEdit(3)}>
        <Row label="Budget" value={budgetLabels[values.budget_range]} />
        <Row label="Timeline" value={timelineLabels[values.timeline]} />
        <Row label="Notes" value={values.notes} />
      </Section>
    </div>
  );
}
