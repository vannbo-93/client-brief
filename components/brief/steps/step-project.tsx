/** @format */

"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/brief/form-field";
import { OptionCards } from "@/components/brief/option-cards";
import {
  projectTypeLabels,
  projectTypeValues,
  type BriefFormValues,
} from "@/lib/validations/brief";

// تحويل القائمة إلى الشكل الذي تحتاجه OptionCards
const projectTypeOptions = projectTypeValues.map((value) => ({
  value,
  label: projectTypeLabels[value].label,
  hint: projectTypeLabels[value].hint,
}));

const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 5000;

export function StepProject() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BriefFormValues>();

  // useWatch يعيد رسم هذا المكون فقط عند تغيّر الوصف (لعدّاد الأحرف)
  const description = useWatch({ control, name: "description" }) ?? "";
  const length = description.trim().length;

  return (
    <div className="space-y-8">
      <OptionCards
        name="project_type"
        legend="What do you need?"
        options={projectTypeOptions}
        error={errors.project_type?.message}
      />

      <FormField
        id="description"
        label="Describe your project"
        hint="What is it for, who will use it, and what should visitors be able to do?"
        error={errors.description?.message}>
        <Textarea
          id="description"
          rows={6}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "description-error" : "description-count"
          }
          {...register("description")}
        />
      </FormField>

      {/* عدّاد الأحرف: رمادي قبل الحد الأدنى، وعادي بعده */}
      <p
        id="description-count"
        className={
          length < DESCRIPTION_MIN
            ? "-mt-6 font-mono text-xs text-muted-foreground"
            : "-mt-6 font-mono text-xs text-foreground"
        }>
        {length < DESCRIPTION_MIN
          ? `${DESCRIPTION_MIN - length} more characters needed`
          : `${length} / ${DESCRIPTION_MAX}`}
      </p>
    </div>
  );
}
