import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { getScan } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const scan = getScan(params.id);
  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  if (!scan.paid) {
    return NextResponse.json(
      { error: "PDF unlocks after payment. Buy the €39 report from the results page." },
      { status: 402 }
    );
  }

  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const reportUrl = `${base}/report/${scan.id}?print=1`;

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.goto(reportUrl, { waitUntil: "networkidle", timeout: 45000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
    });
    await browser.close();

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="a11ysnap-${scan.id.slice(0, 8)}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    const message = err instanceof Error ? err.message : "PDF generation failed";
    console.error("[pdf]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
