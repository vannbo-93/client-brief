/** @format */

"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { BriefFormValues } from "@/lib/validations/brief";

type Option = { value: string; label: string; hint?: string };

type OptionCardsProps = {
  name: FieldPath<BriefFormValues>; // أي حقل في النموذج
  legend: string;
  hint?: string;
  options: Option[];
  error?: string;
  columns?: 2 | 3;
};

export function OptionCards({
  name,
  legend,
  hint,
  options,
  error,
  columns = 2,
}: OptionCardsProps) {
  const { register } = useFormContext<BriefFormValues>();
  const errorId = `${name}-error`;

  return (
    // fieldset + legend: الطريقة الصحيحة لتجميع أزرار radio تحت عنوان واحد
    <fieldset
      aria-invalid={!!error}
      aria-describedby={error ? errorId : undefined}>
      <legend className="mb-3 font-heading text-sm font-bold uppercase">
        {legend}
      </legend>

      {hint && (
        <p className="-mt-1 mb-3 text-sm text-muted-foreground">{hint}</p>
      )}

      <div
        className={cn(
          "grid gap-3",
          columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        )}>
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            {/* الزر الحقيقي: مخفي بصرياً لكنه موجود للوحة المفاتيح وقارئ الشاشة
                peer يسمح للعنصر الذي بعده بتغيير شكله حسب حالة هذا الزر */}
            <input
              type="radio"
              value={option.value}
              className="peer sr-only"
              {...register(name)}
            />

            {/* الشكل المرئي للبطاقة */}
            <span
              className={cn(
                "block h-full border-2 bg-background p-4",
                error ? "border-destructive" : "border-border",
                "hover:shadow-[4px_4px_0_0_var(--color-foreground)]",
                // عند الاختيار: خلفية زرقاء وظل أسود
                "peer-checked:bg-accent peer-checked:shadow-[4px_4px_0_0_var(--color-foreground)]",
                // عند التنقل بلوحة المفاتيح (Tab والأسهم)
                "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground",
              )}>
              <span className="block font-heading text-sm font-bold uppercase">
                {option.label}
              </span>
              {option.hint && (
                <span className="mt-1 block text-sm text-muted-foreground peer-checked:text-foreground">
                  {option.hint}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
