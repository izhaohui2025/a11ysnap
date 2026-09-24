export type Severity = "critical" | "serious" | "moderate" | "minor";

export interface A11yIssue {
  id: string;
  impact: Severity | null;
  description: string;
  help: string;
  helpUrl: string;
  wcagIds: string[];
  nodes: number;
  selectors: string[];
}

export interface ScanResult {
  id: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  score: number;
  violations: A11yIssue[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  paid: boolean;
  stripeSessionId?: string;
  topTips: FixTip[];
}

export interface FixTip {
  rank: number;
  title: string;
  why: string;
  how: string;
  wcagIds: string[];
  impact: Severity | null;
}
