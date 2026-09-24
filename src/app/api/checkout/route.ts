import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/store";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!stripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in .env.local.",
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const scanId = typeof body.scanId === "string" ? body.scanId : "";
    if (!scanId) {
      return NextResponse.json({ error: "scanId is required" }, { status: 400 });
    }

    const scan = getScan(scanId);
    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }
    if (scan.paid) {
      return NextResponse.json({
        url: `/scan/${scanId}?paid=1`,
        alreadyPaid: true,
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe client unavailable" }, { status: 503 });
    }

    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const priceId = process.env.STRIPE_PRICE_ID!;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/scan/${scanId}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/scan/${scanId}?canceled=1`,
      metadata: { scanId },
      payment_intent_data: {
        metadata: { scanId },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
