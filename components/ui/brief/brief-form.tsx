/** @format */

"use client";

import { useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/ui/brief/step-indicator";
import { StepContact } from "@/components/ui/brief/steps/step-contact";
import {
  briefSchema,
  type BriefFormValues,
  type BriefInput,
} from "@/lib/validations/brief";

// =========================================================
// تعريف الخطوات: العنوان + الحقول التي نتحقق منها قبل الانتقال
// FieldPath يضمن أن أسماء الحقول موجودة فعلاً في المخطط
// =========================================================
const STEPS: { title: string; fields: FieldPath<BriefFormValues>[] }[] = [
  { title: "About you", fields: ["client_name", "client_email", "company"] },
  { title: "Your project", fields: ["project_type", "description"] },
  { title: "Details", fields: ["details", "reference_sites"] },
  { title: "Budget & timeline", fields: ["budget_range", "timeline", "notes"] },
  { title: "Review", fields: [] },
];

// مكان مؤقت للخطوات التي سنبنيها في الجزء 3
function StepPlaceholder({ name }: { name: string }) {
  return (
    <div className="border-2 border-dashed border-border p-8 text-center font-mono text-sm text-muted-foreground">
      {name}: coming in part 3
    </div>
  );
}

export function BriefForm() {
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;

  const methods = useForm<BriefFormValues, unknown, BriefInput>({
    resolver: zodResolver(briefSchema),
    // يظهر الخطأ بعد مغادرة الحقل، لا مع أول حرف
    mode: "onTouched",
    // القيم الابتدائية: نص فارغ بدل undefined حتى لا يحذّر React
    defaultValues: {
      client_name: "",
      client_email: "",
      company: "",
      description: "",
      details: {},
      reference_sites: [],
      notes: "",
    },
  });

  // الانتقال للخطوة التالية بعد التحقق من حقول الخطوة الحالية فقط
  async function goNext() {
    const isStepValid = await methods.trigger(STEPS[step].fields, {
      shouldFocus: true,
    });
    if (!isStepValid) return;

    setStep((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((current) => current - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Enter داخل حقل نصي يرسل النموذج كله افتراضياً
  // نحوّله إلى "التالي" في كل الخطوات عدا الأخيرة
  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    const isTextarea = event.target instanceof HTMLTextAreaElement;
    if (event.key === "Enter" && !isTextarea && !isLastStep) {
      event.preventDefault();
      goNext();
    }
  }

  // يُستدعى فقط إذا نجح التحقق من كل الحقول
  function onSubmit(data: BriefInput) {
    // المرحلة 4: سنستبدل هذا بـ Server Action يحفظ في Supabase
    console.log("Brief ready to send:", data);
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        noValidate>
        <StepIndicator steps={STEPS.map((s) => s.title)} current={step} />

        <div className="mt-8">
          {step === 0 && <StepContact />}
          {step === 1 && <StepPlaceholder name="Your project" />}
          {step === 2 && <StepPlaceholder name="Details" />}
          {step === 3 && <StepPlaceholder name="Budget & timeline" />}
          {step === 4 && <StepPlaceholder name="Review" />}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
          ) : (
            <span />
          )}

          {/* key مختلف لكل زر: يمنع React من إعادة استخدام نفس الزر
              وتحويله من button إلى submit أثناء النقر */}
          {isLastStep ? (
            <Button key="submit" type="submit" variant="accent">
              Send brief
            </Button>
          ) : (
            <Button key="next" type="button" variant="accent" onClick={goNext}>
              Next
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
