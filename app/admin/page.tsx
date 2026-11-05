/** @format */

import { Button } from "@/components/ui/button";
import { logout } from "@/app/admin/actions";

// مؤقت: سنستبدله بقائمة الطلبات في الجزء 3
export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl bg-card brutal-border brutal-shadow p-8">
        <h1 className="text-3xl">Admin</h1>
        <p className="mt-4 text-muted-foreground">You are signed in.</p>

        {/* Server Action مباشرة في form - لا يحتاج "use client" */}
        <form action={logout} className="mt-8">
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </div>
    </main>
  );
}
