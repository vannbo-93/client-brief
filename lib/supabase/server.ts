/** @format */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ينشئ عميل Supabase يعمل على السيرفر فقط
// (Server Components و Server Actions و Route Handlers)
export async function createClient() {
  // في Next.js 16 أصبحت cookies() غير متزامنة، لذلك نستخدم await
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // قراءة كل الكوكيز من الطلب الحالي
        getAll() {
          return cookieStore.getAll();
        },
        // كتابة الكوكيز (تُستخدم لاحقاً لجلسة تسجيل دخول لوحة الإدارة)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components لا تستطيع كتابة الكوكيز، وهذا متوقع.
            // سنضيف proxy.ts في المرحلة 5 لتحديث الجلسات.
          }
        },
      },
    },
  );
}
