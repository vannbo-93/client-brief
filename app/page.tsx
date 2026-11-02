/** @format */

// الصفحة الرئيسية: تشرح للعميل ما المطلوب منه وتوجّهه للنموذج
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-neutral-900">
          Tell me about your project
        </h1>

        <p className="mt-4 text-lg text-neutral-600">
          Answer a few guided questions about the website you need. It takes
          about 10 minutes, and I&apos;ll reply within 24 hours.
        </p>

        {/* الرابط سيعمل عند بناء النموذج في المرحلة 3 */}
        <a
          href="/brief"
          className="mt-8 inline-block rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white hover:bg-neutral-700">
          Start your brief
        </a>
      </div>
    </main>
  );
}
