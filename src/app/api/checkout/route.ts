import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const PRICE_MAP: Record<string, { priceId: string; mode: "subscription" | "payment" }> = {
  "codify-monthly": { priceId: "price_1THJKuJeFf5ThhqelxJugRTy", mode: "subscription" },
  "codify-annual": { priceId: "price_1THJHDJeFf5Thhqew25eVn5F", mode: "payment" },
};

export async function POST(request: Request) {
  try {
    const { tier, billing } = await request.json();
    const key = `${tier}-${billing}`;
    const entry = PRICE_MAP[key];

    if (!entry) {
      return NextResponse.json({ error: "Invalid tier or billing period" }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: entry.mode,
      line_items: [{ price: entry.priceId, quantity: 1 }],
      success_url: "https://codify.build/welcome?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://codify.build/pricing",
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
