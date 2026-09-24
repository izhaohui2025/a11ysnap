"use client";

import { useState } from "react";

export function BuyPdfButton({ scanId, paid }: { scanId: string; paid: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (paid) {
    return (
      <a
        href={`/api/pdf/${scanId}`}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white shadow hover:bg-emerald-700"
      >
        Download PDF report
      </a>
    );
  }

  async function checkout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned");
      setLoading(false);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Download PDF — €39"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-500">
        One-time payment for a shareable snapshot PDF (score, full issue table,
        fix tips, disclaimer). Not a certification.
      </p>
    </div>
  );
}
