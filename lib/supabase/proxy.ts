/** @format */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// يُستدعى من proxy.ts قبل كل صفحة في /admin:
// 1. يحدّث جلسة Supabase إن قاربت على الانتهاء (ويحفظها في الكوكيز)
// 2. يحوّل غير المسجّلين إلى صفحة الدخول
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // عند تحديث الجلسة: نكتب الكوكيز الجديدة في الطلب (للصفحة)
        // وفي الرد (للمتصفح)
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ⚠️ لا تضع أي كود بين createServerClient و getClaims
  // getClaims يتحقق من توقيع الجلسة، ولا يثق بما في الكوكي فقط
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  // غير مسجّل ويحاول دخول أي صفحة إدارة ← صفحة الدخول
  if (!isLoggedIn && !isLoginPage) {
    return redirectTo(request, "/admin/login", response);
  }

  // مسجّل ويفتح صفحة الدخول ← لوحة الإدارة مباشرة
  if (isLoggedIn && isLoginPage) {
    return redirectTo(request, "/admin", response);
  }

  return response;
}

// تحويل مع الإبقاء على الكوكيز المحدّثة (وإلا ضاعت الجلسة الجديدة)
function redirectTo(
  request: NextRequest,
  pathname: string,
  from: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
