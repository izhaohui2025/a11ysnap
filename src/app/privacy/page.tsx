export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1 className="text-2xl font-bold text-slate-900">Privacy</h1>
      <p className="mt-4 text-slate-700">
        A11ySnap scans <strong>public HTTP(S) URLs</strong> you submit. We do not
        crawl password-protected pages or accept private/local network addresses.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
        <li>
          <strong>What we store:</strong> the URL, scan timestamp, automated findings
          (axe results), and payment unlock flag if you buy a PDF.
        </li>
        <li>
          <strong>Retention:</strong> scan data is retained for at most{" "}
          <strong>30 days</strong>, then eligible for deletion.
        </li>
        <li>
          <strong>Payments:</strong> handled by Stripe. We store a Stripe session id
          only to unlock your PDF — not full card details.
        </li>
        <li>
          <strong>Rate limits:</strong> we may log IP addresses temporarily (≤1 day
          buckets) to enforce free-scan limits (~5/day).
        </li>
        <li>
          <strong>No accounts</strong> required for the free MVP scan.
        </li>
      </ul>
      <p className="mt-6 text-sm text-slate-500">
        Questions: contact the operator of this deployment. This page is a short MVP
        notice, not a full legal privacy policy.
      </p>
    </div>
  );
}
