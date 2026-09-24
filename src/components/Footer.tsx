import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-700">
          Automated findings only. Not a legal audit, certification, or guarantee
          of EAA/WCAG conformance.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Automation typically finds roughly 30–40% of accessibility issues.
          Manual review and assistive-technology testing are still required for
          full conformance.
        </p>
        <p className="mt-4">
          <Link href="/privacy" className="underline hover:text-slate-900">
            Privacy
          </Link>
          <span className="mx-2">·</span>
          <span>A11ySnap — honest accessibility snapshots</span>
        </p>
      </div>
    </footer>
  );
}
