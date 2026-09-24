import { notFound } from "next/navigation";
import { getScan } from "@/lib/store";

export const dynamic = "force-dynamic";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  serious: "bg-orange-100 text-orange-800",
  moderate: "bg-amber-100 text-amber-800",
  minor: "bg-slate-100 text-slate-700",
};

export default function ReportPage({ params }: { params: { id: string } }) {
  const scan = getScan(params.id);
  if (!scan) notFound();

  // Allow viewing print report for paid scans only (PDF route checks paid too).
  // For local demo, paid flag can be flipped in data/scans/<id>.json
  if (!scan.paid) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">PDF report locked</h1>
        <p className="mt-2 text-slate-600">
          Unlock with the €39 one-time purchase from the{" "}
          <a className="underline" href={`/scan/${scan.id}`}>
            results page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl bg-white px-6 py-10 text-slate-900">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-indigo-700">A11ySnap</p>
        <h1 className="mt-1 text-2xl font-bold">Accessibility snapshot report</h1>
        <p className="mt-2 break-all text-sm text-slate-600">{scan.url}</p>
        <p className="mt-1 text-xs text-slate-500">
          Generated {new Date(scan.createdAt).toISOString()} · Scan ID {scan.id}
        </p>
      </header>

      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <strong>Disclaimer:</strong> Automated findings only. Not a legal audit,
        certification, or guarantee of EAA/WCAG conformance. Automation typically
        finds roughly 30–40% of accessibility issues. Manual review and
        assistive-technology testing remain required.
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Automated score</h2>
        <p className="mt-2 text-5xl font-bold tabular-nums">{scan.score}</p>
        <p className="mt-1 text-sm text-slate-600">
          Progress metric from axe pass/fail ratios on this page only — not a legal
          grade.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {scan.violations.length} violation rule(s) · {scan.passes} passed ·{" "}
          {scan.incomplete} incomplete · {scan.inapplicable} inapplicable
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Top fix tips</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm">
          {scan.topTips.map((tip) => (
            <li key={tip.rank}>
              <strong>{tip.title}</strong>
              {tip.impact && (
                <span
                  className={`ml-2 rounded px-1.5 py-0.5 text-xs capitalize ${
                    SEVERITY_STYLES[tip.impact] || ""
                  }`}
                >
                  {tip.impact}
                </span>
              )}
              <div className="text-slate-600">{tip.why}</div>
              <div>
                <em>How:</em> {tip.how}
              </div>
              {tip.wcagIds.length > 0 && (
                <div className="text-xs text-slate-500">
                  WCAG: {tip.wcagIds.join(", ")}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Full issue table</h2>
        <table className="mt-3 w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="py-2 pr-2">Severity</th>
              <th className="py-2 pr-2">Issue</th>
              <th className="py-2 pr-2">WCAG</th>
              <th className="py-2">Nodes</th>
            </tr>
          </thead>
          <tbody>
            {scan.violations.map((v) => (
              <tr key={v.id} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-2 capitalize">{v.impact || "—"}</td>
                <td className="py-2 pr-2">
                  <div className="font-medium">{v.help}</div>
                  <div className="text-slate-500">{v.id}</div>
                  <div className="mt-1 text-slate-600">{v.description}</div>
                  {v.selectors.length > 0 && (
                    <div className="mt-1 font-mono text-[10px] text-slate-500">
                      e.g. {v.selectors.slice(0, 2).join("; ")}
                    </div>
                  )}
                </td>
                <td className="py-2 pr-2">{v.wcagIds.join(", ") || "—"}</td>
                <td className="py-2">{v.nodes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">
        Automated findings only. Not a legal audit, certification, or guarantee of
        EAA/WCAG conformance. © A11ySnap
      </footer>
    </div>
  );
}
