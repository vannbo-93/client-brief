/** @format */

import { cn } from "@/lib/utils";

type StepIndicatorProps = {
  steps: readonly string[]; // عناوين الخطوات
  current: number; // رقم الخطوة الحالية (يبدأ من 0)
};

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div>
      <p className="font-mono text-xs uppercase text-muted-foreground">
        Step {current + 1} of {steps.length}
      </p>

      <h2 className="mt-1 text-2xl">{steps[current]}</h2>

      {/* مربع لكل خطوة - المكتملة والحالية باللون الأزرق */}
      <div
        className="mt-4 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        aria-hidden="true">
        {steps.map((title, index) => (
          <div
            key={title}
            className={cn(
              "h-2 border-2 border-border",
              index <= current ? "bg-accent" : "bg-background",
            )}
          />
        ))}
      </div>
    </div>
  );
}
