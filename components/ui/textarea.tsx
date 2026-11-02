/** @format */

import * as React from "react";
import { cn } from "@/lib/utils";

// مربع نص متعدد الأسطر بنفس أسلوب Input
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-32 w-full resize-y bg-background px-4 py-3 text-base text-foreground",
        "border-2 border-border outline-none",
        "placeholder:text-muted-foreground",
        "focus-visible:shadow-[4px_4px_0_0_var(--color-accent)]",
        "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[4px_4px_0_0_var(--color-destructive)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
