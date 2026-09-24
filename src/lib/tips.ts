import { A11yIssue, FixTip, Severity } from "./types";

const IMPACT_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

const HOW_HINTS: Record<string, string> = {
  "image-alt": "Add a meaningful alt attribute describing the image purpose, or alt=\"\" for decorative images.",
  "button-name": "Give the button accessible text via content, aria-label, or aria-labelledby.",
  "link-name": "Ensure the link has discernible text (visible text or aria-label).",
  "color-contrast": "Increase contrast between text and background to at least 4.5:1 (3:1 for large text).",
  "label": "Associate form controls with a <label> or use aria-label / aria-labelledby.",
  "html-has-lang": "Add a lang attribute on the <html> element (e.g. lang=\"en\").",
  "document-title": "Provide a unique, descriptive <title> for the page.",
  "landmark-one-main": "Wrap primary content in a single <main> landmark.",
  "region": "Ensure all page content is contained in landmarks (header, nav, main, footer, etc.).",
  "list": "Use proper <ul>/<ol>/<li> structure; don't fake lists with divs alone.",
  "heading-order": "Don't skip heading levels (h1 → h2 → h3); keep a logical outline.",
  "frame-title": "Give every <iframe> a descriptive title attribute.",
  "meta-viewport": "Avoid user-scalable=no and maximum-scale < 2 so users can zoom.",
  "duplicate-id": "Ensure every id attribute is unique on the page.",
  "aria-allowed-attr": "Remove or fix ARIA attributes that are not allowed on this role.",
  "aria-required-attr": "Add required ARIA attributes for the element's role.",
  "aria-roles": "Use a valid ARIA role value from the ARIA specification.",
  "nested-interactive": "Don't nest interactive elements (e.g. button inside link).",
  "scrollable-region-focusable": "Make scrollable regions focusable (tabindex=\"0\") so keyboard users can scroll them.",
};

function impactRank(impact: Severity | null): number {
  if (!impact) return 99;
  return IMPACT_ORDER[impact] ?? 99;
}

export function buildTopTips(violations: A11yIssue[], limit = 5): FixTip[] {
  const sorted = [...violations].sort((a, b) => {
    const ia = impactRank(a.impact);
    const ib = impactRank(b.impact);
    if (ia !== ib) return ia - ib;
    return b.nodes - a.nodes;
  });

  return sorted.slice(0, limit).map((v, i) => ({
    rank: i + 1,
    title: v.help || v.id,
    why: v.description,
    how: HOW_HINTS[v.id] || `Review axe rule "${v.id}" and apply the WCAG technique linked in helpUrl.`,
    wcagIds: v.wcagIds,
    impact: v.impact,
  }));
}
