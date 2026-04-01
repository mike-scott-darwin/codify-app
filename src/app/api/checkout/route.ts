import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const PRICE_MAP: Record<string, string> = {
  "pro-monthly": "price_1THJLoJeFf5ThhqeOAb30zLx",
  "pro-annual": "price_1THJEiJeFf5ThhqemgH1GCI4",
  "vip-monthly": "price_1THJKuJeFf5ThhqelxJugRTy",
  "vip-annual": "price_1THJHDJeFf5Thhqew25eVn5F",
};

export async function POST(request: Request) {
  try {
    const { tier, billing } = await request.json();
    const key = `${tier}-${billing}`;
    const priceId = PRICE_MAP[key];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier or billing period" }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
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
