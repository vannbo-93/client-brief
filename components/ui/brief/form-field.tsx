/** @format */

import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string; // يجب أن يطابق id الحقل نفسه
  label: string;
  hint?: string; // نص مساعد تحت العنوان
  error?: string; // رسالة الخطأ من Zod
  optional?: boolean;
  children: React.ReactNode; // الحقل نفسه (Input أو Textarea...)
};

// يجمع: العنوان + النص المساعد + الحقل + رسالة الخطأ
// حتى لا نكرر نفس الهيكل في كل حقل
export function FormField({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-heading text-sm font-bold uppercase">
        {label}
        {optional && (
          <span className="font-mono text-xs font-normal normal-case text-muted-foreground">
            (optional)
          </span>
        )}
      </Label>

      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}

      {children}

      {/* role="alert" يجعل قارئ الشاشة ينطق الخطأ فور ظهوره */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
