/** @format */

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// الصفحة الرئيسية: تشرح للعميل ما المطلوب منه وتوجّهه للنموذج
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full bg-card brutal-border brutal-shadow p-8 sm:p-12">
        {/* شارة صغيرة فوق العنوان */}
        <span className="inline-block bg-accent text-accent-foreground brutal-border-thin px-3 py-1 font-mono text-xs uppercase">
          Project Brief
        </span>

        <h1 className="mt-6 text-4xl sm:text-5xl text-foreground">
          Tell me about your project
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Answer a few guided questions about the website you need. It takes
          about 10 minutes, and I&apos;ll reply within 24 hours.
        </p>

        {/* Link بشكل زر - نستخدم buttonVariants بدل وضع <a> داخل <Button> */}
        <Link
          href="/brief"
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "mt-8",
          })}>
          Start your brief
        </Link>
      </div>
    </main>
  );
}
