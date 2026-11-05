/** @format */

import Link from "next/link";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  budgetLabels,
  projectTypeLabels,
  statusLabels,
  statusValues,
  type BriefStatus,
  type BudgetRange,
  type ProjectType,
} from "@/lib/validations/brief";

// الأعمدة التي نحتاجها في القائمة فقط - لا نجلب الوصف والتفاصيل هنا
type BriefListItem = {
  id: string;
  created_at: string;
  status: BriefStatus;
  client_name: string;
  client_email: string;
  company: string | null;
  project_type: ProjectType;
  budget_range: BudgetRange;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// التاريخ بتوقيت المغرب: السيرفر على Vercel يعمل بتوقيت UTC،
// فبدون timeZone سيظهر الوقت مختلفاً عن وقتك الفعلي
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Casablanca",
});

// هل القيمة من الرابط حالة صالحة؟ (أي شخص يستطيع كتابة ?status=xyz)
function isBriefStatus(value: unknown): value is BriefStatus {
  return (
    typeof value === "string" &&
    (statusValues as readonly string[]).includes(value)
  );
}

// مكوّن ديناميكي: يقرأ searchParams والكوكيز وقاعدة البيانات
// لذلك يجب أن يكون داخل <Suspense> في الصفحة
export async function BriefsList({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const activeStatus = isBriefStatus(status) ? status : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("briefs")
    .select(
      "id, created_at, status, client_name, client_email, company, project_type, budget_range",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load briefs:", error);
    return (
      <p
        role="alert"
        className="border-2 border-destructive bg-destructive/10 p-4 text-destructive">
        Could not load briefs. Check the server logs.
      </p>
    );
  }

  // Supabase لا يعرف أنواع جدولنا بعد، فنحددها بأنفسنا
  const briefs = (data ?? []) as BriefListItem[];

  // عدد الطلبات لكل حالة - نحسبه من نفس البيانات بدل استعلام إضافي
  const counts = Object.fromEntries(
    statusValues.map((value) => [
      value,
      briefs.filter((b) => b.status === value).length,
    ]),
  ) as Record<BriefStatus, number>;

  const visibleBriefs = activeStatus
    ? briefs.filter((brief) => brief.status === activeStatus)
    : briefs;

  const tabs: { label: string; value: BriefStatus | null; count: number }[] = [
    { label: "All", value: null, count: briefs.length },
    ...statusValues.map((value) => ({
      label: statusLabels[value],
      value,
      count: counts[value],
    })),
  ];

  return (
    <div>
      {/* تبويبات الحالة: روابط عادية، فتعمل بدون JavaScript ويمكن مشاركتها */}
      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.value === activeStatus;
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/admin?status=${tab.value}` : "/admin"}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "border-2 border-border px-3 py-1.5 font-mono text-xs uppercase",
                isActive
                  ? "bg-foreground text-background"
                  : "bg-background hover:bg-secondary",
              )}>
              {tab.label} ({tab.count})
            </Link>
          );
        })}
      </nav>

      {visibleBriefs.length === 0 ? (
        <p className="mt-8 border-2 border-dashed border-border p-8 text-center text-muted-foreground">
          {activeStatus ? "No briefs with this status." : "No briefs yet."}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visibleBriefs.map((brief) => (
            <li key={brief.id}>
              <Link
                href={`/admin/briefs/${brief.id}`}
                className="block bg-card brutal-border p-4 hover:shadow-[4px_4px_0_0_var(--color-foreground)]">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading font-bold uppercase">
                      {brief.client_name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {brief.client_email}
                      {brief.company && ` · ${brief.company}`}
                    </p>
                  </div>
                  <StatusBadge status={brief.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                  <span>{projectTypeLabels[brief.project_type].label}</span>
                  <span>{budgetLabels[brief.budget_range]}</span>
                  <time dateTime={brief.created_at}>
                    {dateFormatter.format(new Date(brief.created_at))}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
