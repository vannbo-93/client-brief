/** @format */

"use client";

import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import { updateBriefStatus } from "@/app/admin/actions";
import { statusClasses } from "@/components/admin/status-badge";
import {
  statusLabels,
  statusValues,
  type BriefStatus,
} from "@/lib/validations/brief";

type StatusFormProps = {
  briefId: string;
  currentStatus: BriefStatus;
};

export function StatusForm({ briefId, currentStatus }: StatusFormProps) {
  // useTransition: isPending = true أثناء انتظار السيرفر
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function changeStatus(status: BriefStatus) {
    if (status === currentStatus) return;
    setError(null);

    startTransition(async () => {
      const result = await updateBriefStatus(briefId, status);
      if (!result.ok) setError(result.error);
      // عند النجاح: revalidatePath يعيد رسم الصفحة بالحالة الجديدة
    });
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Change status"
        className="flex flex-wrap gap-2">
        {statusValues.map((status) => {
          const isCurrent = status === currentStatus;
          return (
            <button
              key={status}
              type="button"
              onClick={() => changeStatus(status)}
              disabled={isPending}
              aria-pressed={isCurrent}
              className={cn(
                "border-2 border-border px-3 py-1.5 font-mono text-xs uppercase disabled:opacity-50",
                isCurrent
                  ? statusClasses[status]
                  : "bg-background hover:bg-secondary",
              )}>
              {statusLabels[status]}
            </button>
          );
        })}
      </div>

      {isPending && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Saving...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
