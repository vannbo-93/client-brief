/** @format */

"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/brief/form-field";
import type { BriefFormValues } from "@/lib/validations/brief";

export function StepContact() {
  // نحصل على النموذج من FormProvider في brief-form.tsx
  // بدل تمرير register و errors كـ props
  const {
    register,
    formState: { errors },
  } = useFormContext<BriefFormValues>();

  return (
    <div className="space-y-6">
      <FormField
        id="client_name"
        label="Your name"
        error={errors.client_name?.message}>
        <Input
          id="client_name"
          autoComplete="name"
          aria-invalid={!!errors.client_name}
          aria-describedby={
            errors.client_name ? "client_name-error" : undefined
          }
          {...register("client_name")}
        />
      </FormField>

      <FormField
        id="client_email"
        label="Email"
        hint="I'll send my reply here."
        error={errors.client_email?.message}>
        <Input
          id="client_email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.client_email}
          aria-describedby={
            errors.client_email ? "client_email-error" : undefined
          }
          {...register("client_email")}
        />
      </FormField>

      <FormField
        id="company"
        label="Company or brand"
        optional
        error={errors.company?.message}>
        <Input
          id="company"
          autoComplete="organization"
          aria-invalid={!!errors.company}
          aria-describedby={errors.company ? "company-error" : undefined}
          {...register("company")}
        />
      </FormField>
    </div>
  );
}
