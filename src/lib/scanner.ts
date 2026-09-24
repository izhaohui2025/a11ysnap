import { chromium, type Browser } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { v4 as uuidv4 } from "uuid";
import { A11yIssue, ScanResult, Severity } from "./types";
import { computeScore } from "./score";
import { buildTopTips } from "./tips";

const RETENTION_DAYS = 30;

function extractWcagIds(tags: string[]): string[] {
  return tags
    .filter((t) => /^wcag\d+/i.test(t) || /^best-practice$/i.test(t))
    .map((t) => {
      // wcag2aa → WCAG 2 AA, wcag111 → 1.1.1
      const m = t.match(/^wcag(\d)(\d)(\d)$/i);
      if (m) return `${m[1]}.${m[2]}.${m[3]}`;
      if (/^wcag21aa$/i.test(t)) return "WCAG 2.1 AA";
      if (/^wcag22aa$/i.test(t)) return "WCAG 2.2 AA";
      if (/^wcag2aa$/i.test(t)) return "WCAG 2 AA";
      if (/^wcag2a$/i.test(t)) return "WCAG 2 A";
      return t;
    });
}

function normalizeUrl(raw: string): string {
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  const parsed = new URL(u);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http/https URLs are allowed");
  }
  // Block obvious private hosts for MVP
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    throw new Error("Private/local URLs are not allowed. Scan public pages only.");
  }
  return parsed.toString();
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
  }
  try {
    const b = await browserPromise;
    if (!b.isConnected()) {
      browserPromise = null;
      return getBrowser();
    }
    return b;
  } catch {
    browserPromise = null;
    throw new Error("Failed to launch browser");
  }
}

export async function runScan(rawUrl: string): Promise<ScanResult> {
  const url = normalizeUrl(rawUrl);
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "A11ySnapBot/0.1 (+https://a11ysnap.local; automated accessibility snapshot)",
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    // Brief settle for late paint / SPA shells
    await page.waitForTimeout(1500);

    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();

    const violations: A11yIssue[] = axeResults.violations.map((v) => ({
      id: v.id,
      impact: (v.impact as Severity | null) ?? null,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      wcagIds: extractWcagIds(v.tags),
      nodes: v.nodes.length,
      selectors: v.nodes
        .slice(0, 5)
        .map((n) => n.target.join(" "))
        .filter(Boolean),
    }));

    const passes = axeResults.passes.length;
    const incomplete = axeResults.incomplete.length;
    const inapplicable = axeResults.inapplicable.length;
    const score = computeScore({ violations, passes, incomplete });
    const topTips = buildTopTips(violations, 5);

    const now = new Date();
    const expires = new Date(now.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);

    return {
      id: uuidv4(),
      url,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      score,
      violations,
      passes,
      incomplete,
      inapplicable,
      paid: false,
      topTips,
    };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}
