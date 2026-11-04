/** @format */

"use client";

import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/brief/form-field";
import { OptionCards } from "@/components/brief/option-cards";
import { getQuestions } from "@/lib/brief-questions";
import type { BriefFormValues } from "@/lib/validations/brief";

// =========================================================
// حقل الروابط: العميل يكتب رابطاً في كل سطر،
// ونحوّله إلى مصفوفة كما يتوقع المخطط
// =========================================================

// "dribbble.com/x" ← "https://dribbble.com/x"
function parseLinks(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((link) => (/^https?:\/\//i.test(link) ? link : `https://${link}`));
}

function ReferenceSitesInput({
  value,
  onChange,
  onBlur,
  invalid,
}: {
  value: string[];
  onChange: (links: string[]) => void;
  onBlur: () => void;
  invalid: boolean;
}) {
  // نحتفظ بالنص كما يكتبه العميل (مع الأسطر الفارغة)
  // ونرسل للنموذج المصفوفة المنظّفة فقط
  const [text, setText] = useState(value.join("\n"));

  return (
    <Textarea
      id="reference_sites"
      rows={4}
      placeholder={"stripe.com\nhttps://www.awwwards.com/..."}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(parseLinks(event.target.value));
      }}
      onBlur={onBlur}
      aria-invalid={invalid}
      aria-describedby={invalid ? "reference_sites-error" : undefined}
    />
  );
}

// =========================================================
// الخطوة
// =========================================================
export function StepDetails() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BriefFormValues>();

  // الأسئلة تتغير حسب النوع المختار في الخطوة 2
  const projectType = useWatch({ control, name: "project_type" });
  const questions = getQuestions(projectType);

  // أخطاء الروابط قد تكون على المصفوفة كلها (أكثر من 5)
  // أو على رابط واحد (صيغة خاطئة) - نعرض أول خطأ نجده
  const refErrors = errors.reference_sites;
  const refErrorMessage =
    refErrors?.message ??
    (Array.isArray(refErrors) ? refErrors.find(Boolean)?.message : undefined);

  return (
    <div className="space-y-8">
      {questions.map((question) => {
        const name = `details.${question.key}` as const;
        const id = `details-${question.key}`;
        const error = errors.details?.[question.key]?.message;

        if (question.type === "choice") {
          return (
            <OptionCards
              key={question.key}
              name={name}
              legend={question.label}
              hint={question.hint}
              options={question.options}
              error={error}
              columns={question.options.length >= 3 ? 3 : 2}
            />
          );
        }

        return (
          <FormField
            key={question.key}
            id={id}
            label={question.label}
            hint={question.hint}
            error={error}>
            {question.type === "textarea" ? (
              <Textarea
                id={id}
                rows={4}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                {...register(name)}
              />
            ) : (
              <Input
                id={id}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                {...register(name)}
              />
            )}
          </FormField>
        );
      })}

      <FormField
        id="reference_sites"
        label="Websites you like"
        hint="One link per line, up to 5. Tell me what you like about them in the notes later."
        optional
        error={refErrorMessage}>
        {/* Controller: لحقل قيمته ليست نصاً بسيطاً (هنا مصفوفة) */}
        <Controller
          control={control}
          name="reference_sites"
          render={({ field }) => (
            <ReferenceSitesInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!refErrorMessage}
            />
          )}
        />
      </FormField>
    </div>
  );
}
