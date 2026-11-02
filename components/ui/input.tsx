/** @format */

import * as React from "react";
import { cn } from "@/lib/utils";

// حقل نصي بأسلوب Brutalist: إطار أسود سميك، وظل أزرق عند التركيز، وأحمر عند الخطأ
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full bg-background px-4 text-base text-foreground",
        "border-2 border-border outline-none",
        "placeholder:text-muted-foreground",
        // عند التركيز: ظل حاد باللون الأزرق
        "focus-visible:shadow-[4px_4px_0_0_var(--color-accent)]",
        // عند الخطأ (aria-invalid="true"): إطار وظل أحمران
        "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[4px_4px_0_0_var(--color-destructive)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
