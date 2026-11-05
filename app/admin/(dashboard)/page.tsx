/** @format */

import { Suspense } from "react";
import type { Metadata } from "next";

import { BriefsList } from "@/components/admin/briefs-list";
import { BriefsListSkeleton } from "@/components/admin/briefs-list-skeleton";

export const metadata: Metadata = {
  title: "Briefs | Admin",
  robots: { index: false, follow: false },
};

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// الصفحة نفسها لا تقرأ أي شيء ديناميكي:
// نمرر searchParams كما هو (Promise) إلى BriefsList داخل Suspense
export default function AdminPage({ searchParams }: AdminPageProps) {
  return (
    <>
      <h1 className="mb-8 text-3xl">Briefs</h1>

      <Suspense fallback={<BriefsListSkeleton />}>
        <BriefsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
