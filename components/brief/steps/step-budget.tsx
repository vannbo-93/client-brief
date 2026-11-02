/** @format */

"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/brief/form-field";
import { OptionCards } from "@/components/brief/option-cards";
import {
  budgetLabels,
  budgetValues,
  timelineLabels,
  timelineValues,
  type BriefFormValues,
} from "@/lib/validations/brief";

const budgetOptions = budgetValues.map((value) => ({
  value,
  label: budgetLabels[value],
}));
const timelineOptions = timelineValues.map((value) => ({
  value,
  label: timelineLabels[value],
}));

export function StepBudget() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BriefFormValues>();

  return (
    <div className="space-y-8">
      <OptionCards
        name="budget_range"
        legend="Budget"
        options={budgetOptions}
        error={errors.budget_range?.message}
      />

      <OptionCards
        name="timeline"
        legend="When do you need it?"
        options={timelineOptions}
        error={errors.timeline?.message}
      />

      <FormField
        id="notes"
        label="Anything else?"
        hint="Deadlines, things you didn't like in past websites, questions for me..."
        optional
        error={errors.notes?.message}>
        <Textarea
          id="notes"
          rows={4}
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? "notes-error" : undefined}
          {...register("notes")}
        />
      </FormField>
    </div>
  );
}
