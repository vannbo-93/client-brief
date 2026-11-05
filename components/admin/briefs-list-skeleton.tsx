/** @format */

// يظهر أثناء انتظار البيانات - بنفس شكل القائمة تقريباً
// حتى لا "تقفز" الصفحة عند ظهور البيانات
export function BriefsListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading briefs">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse bg-muted" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse border-2 border-muted bg-muted/50"
          />
        ))}
      </div>
    </div>
  );
}
