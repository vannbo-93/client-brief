/** @format */

import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { BriefDetail } from "@/components/admin/brief-detail";

export const metadata: Metadata = {
  title: "Brief | Admin",
  robots: { index: false, follow: false },
};

type BriefPageProps = {
  params: Promise<{ id: string }>;
};

// نفس نمط صفحة القائمة: params يُمرَّر كـ Promise ويُنتظر داخل Suspense
export default function BriefPage({ params }: BriefPageProps) {
  return (
    <>
      <Link
        href="/admin"
        className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground">
        ← All briefs
      </Link>

      <Suspense fallback={<div className="mt-6 h-96 animate-pulse bg-muted" />}>
        <BriefDetail params={params} />
      </Suspense>
    </>
  );
}
