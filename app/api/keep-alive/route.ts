/** @format */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// يستدعيه Vercel Cron مرة يومياً (vercel.json)
// الهدف: قراءة من قاعدة البيانات حتى لا توقف Supabase المشروع بسبب الخمول
export async function GET(request: NextRequest) {
  // Vercel يرسل: Authorization: Bearer <CRON_SECRET>
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // عميل بسيط بلا كوكيز: لا نحتاج جلسة مستخدم هنا
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );

  // قراءة خفيفة: العدد فقط بلا بيانات
  // بسبب RLS سيكون 0 دائماً، لكن الاستعلام يصل لقاعدة البيانات، وهذا المطلوب
  const { error } = await supabase
    .from("briefs")
    .select("id", { count: "exact", head: true });

  if (error) {
    // التفاصيل في السجل فقط - تعلّمنا ذلك من /api/health
    console.error("Keep-alive failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  console.log("Keep-alive OK");
  return NextResponse.json({ ok: true });
}
