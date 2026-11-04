/** @format */

"use client";

import { useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/brief/step-indicator";
import { StepContact } from "@/components/brief/steps/step-contact";
import { StepProject } from "@/components/brief/steps/step-project";
import { StepDetails } from "@/components/brief/steps/step-details";
import { StepBudget } from "@/components/brief/steps/step-budget";
import { StepReview } from "@/components/brief/steps/step-review";
import { validateDetails } from "@/lib/brief-questions";
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

    // الخطوة 3: أسئلة Details تعتمد على نوع المشروع،
    // لذلك نتحقق منها بدالة منفصلة بدل Zod
    let areDetailsValid = true;
    if (step === 2) {
      const { project_type, details } = methods.getValues();
      const detailErrors = Object.entries(
        validateDetails(project_type, details),
      );

      detailErrors.forEach(([key, message], index) => {
        methods.setError(
          `details.${key}`,
          { type: "manual", message },
          { shouldFocus: index === 0 }, // المؤشر لأول خطأ فقط
        );
      });

      areDetailsValid = detailErrors.length === 0;
    }

    if (!isStepValid || !areDetailsValid) return;

    setStep((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // الرجوع للخطوة السابقة - القيم تبقى محفوظة
  function goBack() {
    setStep((current) => current - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // من صفحة المراجعة: الانتقال مباشرة إلى خطوة معينة للتعديل
  function goToStep(stepIndex: number) {
    setStep(stepIndex);
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
          {step === 1 && <StepProject />}
          {step === 2 && <StepDetails />}
          {step === 3 && <StepBudget />}
          {step === 4 && <StepReview onEdit={goToStep} />}
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
