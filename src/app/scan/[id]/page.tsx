import { notFound } from "next/navigation";
import { getScan } from "@/lib/store";
import { BuyPdfButton } from "@/components/BuyPdfButton";
import type { Severity } from "@/lib/types";

export const dynamic = "force-dynamic";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  serious: "bg-orange-100 text-orange-800",
  moderate: "bg-amber-100 text-amber-800",
  minor: "bg-slate-100 text-slate-700",
};

function countBySeverity(violations: { impact: Severity | null }[]) {
  const counts: Record<string, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  for (const v of violations) {
    const key = v.impact || "minor";
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

export default function ScanPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string; canceled?: string };
}) {
  const scan = getScan(params.id);
  if (!scan) notFound();

  const bySev = countBySeverity(scan.violations);
  const scoreColor =
    scan.score >= 80 ? "text-emerald-600" : scan.score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {searchParams.paid === "1" && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Payment received (or webhook pending). If the download button below still
          says Buy, wait a moment and refresh — the webhook marks the scan paid.
        </div>
      )}
      {searchParams.canceled === "1" && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Checkout canceled. You can still view free results below.
        </div>
      )}

      <p className="text-sm text-slate-500">
        Scanned{" "}
        <a href={scan.url} className="underline break-all" target="_blank" rel="noreferrer">
          {scan.url}
        </a>
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Scan results</h1>
      <p className="mt-1 text-sm text-slate-500">
        Automated findings only · score is a progress metric, not a legal grade
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">Automated score</p>
          <p className={`mt-2 text-5xl font-bold tabular-nums ${scoreColor}`}>
            {scan.score}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Based on axe pass/fail ratios on this page only
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Issues by severity</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(["critical", "serious", "moderate", "minor"] as const).map((s) => (
              <li key={s} className="flex justify-between">
                <span className={`rounded px-2 py-0.5 capitalize ${SEVERITY_STYLES[s]}`}>
                  {s}
                </span>
                <span className="font-mono tabular-nums">{bySev[s]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            {scan.violations.length} rule(s) with violations · {scan.passes} passed ·{" "}
            {scan.incomplete} incomplete
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Top 5 fix tips</h2>
        <p className="mt-1 text-sm text-slate-500">
          Prioritized by impact and number of affected nodes. Start here.
        </p>
        {scan.topTips.length === 0 ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            No automated violations on this pass. That does not mean the page is fully
            WCAG-conformant — manual and assistive-technology testing are still needed.
          </p>
        ) : (
          <ol className="mt-4 space-y-4">
            {scan.topTips.map((tip) => (
              <li
                key={tip.rank}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {tip.rank}
                  </span>
                  <h3 className="font-semibold text-slate-900">{tip.title}</h3>
                  {tip.impact && (
                    <span
                      className={`rounded px-2 py-0.5 text-xs capitalize ${
                        SEVERITY_STYLES[tip.impact] || ""
                      }`}
                    >
                      {tip.impact}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">{tip.why}</p>
                <p className="mt-2 text-sm text-slate-800">
                  <strong>How:</strong> {tip.how}
                </p>
                {tip.wcagIds.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    WCAG / tags: {tip.wcagIds.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">All issues</h2>
        {scan.violations.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No violations returned by axe.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Rule</th>
                  <th className="px-3 py-2">WCAG</th>
                  <th className="px-3 py-2">Nodes</th>
                </tr>
              </thead>
              <tbody>
                {scan.violations.map((v) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs capitalize ${
                          SEVERITY_STYLES[v.impact || "minor"] || ""
                        }`}
                      >
                        {v.impact || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <a
                        href={v.helpUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-indigo-700 underline"
                      >
                        {v.help}
                      </a>
                      <div className="text-xs text-slate-500">{v.id}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {v.wcagIds.join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums">{v.nodes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Shareable PDF snapshot — €39
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Cover, score, full issue table, fix tips, and the same disclaimer. Useful for
          engineering/product discussion — not a legal audit or certification.
        </p>
        <div className="mt-4">
          <BuyPdfButton scanId={scan.id} paid={scan.paid} />
        </div>
      </section>
    </div>
  );
}
