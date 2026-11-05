/** @format */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/admin/actions";

// يُطبَّق على كل صفحات الإدارة، ما عدا /admin/login (خارج المجموعة)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-3 border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="font-heading text-lg font-bold uppercase">
              Client Brief
            </span>
            <span className="bg-accent text-accent-foreground brutal-border-thin px-2 py-0.5 font-mono text-xs uppercase">
              Admin
            </span>
          </Link>

          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
