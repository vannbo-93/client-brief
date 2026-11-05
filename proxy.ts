/** @format */

import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: proxy.ts (كان اسمه middleware.ts سابقاً)
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// يعمل فقط على صفحات الإدارة
// النموذج العام لا يحتاج جلسات، فلا داعي لإبطائه
export const config = {
  matcher: ["/admin/:path*"],
};
