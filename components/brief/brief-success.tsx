/** @format */

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type BriefSuccessProps = {
  email: string; // نعرضه حتى يتأكد العميل أنه كتبه صحيحاً
};

export function BriefSuccess({ email }: BriefSuccessProps) {
  return (
    // role="status" يجعل قارئ الشاشة يعلن النجاح
    <div role="status" className="text-center">
      <span className="inline-block bg-accent text-accent-foreground brutal-border-thin px-3 py-1 font-mono text-xs uppercase">
        Brief received
      </span>

      <h2 className="mt-6 text-3xl">Thank you!</h2>

      <p className="mt-4 text-muted-foreground">
        I&apos;ll review your answers and reply to{" "}
        <span className="font-bold text-foreground break-all">{email}</span>{" "}
        within 24 hours.
      </p>

      <Link
        href="/"
        className={buttonVariants({ variant: "outline", className: "mt-8" })}>
        Back to home
      </Link>
    </div>
  );
}
