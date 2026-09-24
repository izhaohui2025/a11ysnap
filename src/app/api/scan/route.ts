import { NextRequest, NextResponse } from "next/server";
import { runScan } from "@/lib/scanner";
import { saveScan, checkAndIncrementRate } from "@/lib/store";
import { getClientIp } from "@/lib/client-ip";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp();
    const rate = checkAndIncrementRate(ip);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Rate limit: max 5 free scans per IP per day. Try again tomorrow." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url : "";
    if (!url.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const scan = await runScan(url);
    saveScan(scan);

    return NextResponse.json({
      id: scan.id,
      url: scan.url,
      score: scan.score,
      violationCount: scan.violations.length,
      remaining: rate.remaining,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    console.error("[scan]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
