import { ScanForm } from "@/components/ScanForm";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Accessibility snapshot in under a minute
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Paste a public URL. A11ySnap runs{" "}
          <strong>automated</strong> axe-core checks against machine-testable WCAG
          criteria and returns a prioritized issue list — score, severity, WCAG IDs,
          and top fix tips.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          This is a progress metric for engineering, not a legal grade. We never claim
          EAA/ADA compliance, certification, or that a clean scan eliminates legal risk.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ScanForm />
      </div>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Free scan</h2>
          <p className="mt-2 text-sm text-slate-600">
            Score, issues by severity, WCAG IDs, top-5 fix tips. No account required.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">€39 PDF</h2>
          <p className="mt-2 text-sm text-slate-600">
            Shareable snapshot report for product/engineering backlog — one-time via
            Stripe.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Honest limits</h2>
          <p className="mt-2 text-sm text-slate-600">
            Automation finds ~30–40% of issues. Manual + AT testing still required.
          </p>
        </div>
      </section>
    </div>
  );
}
