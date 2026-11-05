/** @format */

import { cn } from "@/lib/utils";
import { statusLabels, type BriefStatus } from "@/lib/validations/brief";

// الكلاسات معرّفة في globals.css (status-new, status-reviewing...)
// Record يضمن وجود كلاس لكل حالة
export const statusClasses: Record<BriefStatus, string> = {
  new: "status-new",
  reviewing: "status-reviewing",
  accepted: "status-accepted",
  rejected: "status-rejected",
};

export function StatusBadge({ status }: { status: BriefStatus }) {
  return (
    <span
      className={cn(
        "inline-block brutal-border-thin px-2 py-0.5 font-mono text-xs uppercase",
        statusClasses[status],
      )}>
      {statusLabels[status]}
    </span>
  );
}
