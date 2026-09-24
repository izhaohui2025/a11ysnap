import { A11yIssue } from "./types";

/** Progress metric only — not a legal grade. Weighted by impact + pass ratio. */
export function computeScore(opts: {
  violations: A11yIssue[];
  passes: number;
  incomplete: number;
}): number {
  const weights: Record<string, number> = {
    critical: 10,
    serious: 5,
    moderate: 2,
    minor: 1,
  };
  let penalty = 0;
  for (const v of opts.violations) {
    const w = weights[v.impact || "minor"] ?? 1;
    penalty += w * Math.min(v.nodes, 10);
  }
  const base = 100 - Math.min(95, penalty);
  // Soften with pass ratio so empty pages don't look perfect by accident
  const total = opts.passes + opts.violations.length + opts.incomplete;
  if (total === 0) return 0;
  const passRatio = opts.passes / total;
  const blended = Math.round(base * 0.7 + passRatio * 100 * 0.3);
  return Math.max(0, Math.min(100, blended));
}
