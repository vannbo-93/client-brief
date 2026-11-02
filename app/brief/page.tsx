/** @format */

import type { Metadata } from "next";
import { BriefForm } from "@/components/brief/brief-form";

export const metadata: Metadata = {
  title: "Start your brief | VANNBO",
};

// الصفحة نفسها Server Component - فقط النموذج داخلها Client Component
export default function BriefPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-2xl bg-card brutal-border brutal-shadow p-6 sm:p-10">
        <BriefForm />
      </div>
    </main>
  );
}
