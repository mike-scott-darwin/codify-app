import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const PRICE_TO_TIER: Record<string, string> = {
  // TODO: Update with new Stripe price IDs after creating Codify $497 product
  // Old price IDs kept for backwards compatibility during transition
  "price_1THJLoJeFf5ThhqeOAb30zLx": "codify",    // was pro-monthly
  "price_1THJEiJeFf5ThhqemgH1GCI4": "codify",    // was pro-annual
  "price_1THJKuJeFf5ThhqelxJugRTy": "codify",    // was vip-monthly
  "price_1THJHDJeFf5Thhqew25eVn5F": "codify",    // was vip-annual
  "price_TODO_codify_monthly": "codify",
  "price_TODO_codify_annual": "codify",
};

const GHL_API_URL = "https://services.leadconnectorhq.com/contacts/";
const GHL_LOCATION_ID = "AKRQpXEUDgloSAbxzDmh";

async function upsertGhlContact(email: string, name: string, tag: string) {
  const apiKey = process.env.GHL_API_KEY!;

  // Search for existing contact
  const searchRes = await fetch(
    `${GHL_API_URL}search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-04-15",
        Accept: "application/json",
      },
    }
  );

  let contactId: string | null = null;

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    contactId = searchData.contact?.id || null;
  }

  if (contactId) {
    // Update existing contact — add tag
    await fetch(`${GHL_API_URL}${contactId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-04-15",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: [tag, "codify-paid"],
        source: "stripe-checkout",
      }),
    });
  } else {
    // Create new contact
    const [firstName, ...rest] = (name || "").split(" ");
    const lastName = rest.join(" ") || "";

    const createRes = await fetch(`${GHL_API_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-04-15",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        firstName: firstName || "Customer",
        lastName,
        email,
        tags: [tag, "codify-paid"],
        source: "stripe-checkout",
      }),
    });

    if (createRes.ok) {
      const data = await createRes.json();
      contactId = data.contact?.id || null;
    }
  }

  return contactId;
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  // If webhook secret is set, verify signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && sig) {
    try {
      event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    event = JSON.parse(body) as Stripe.Event;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email;

    if (!email) {
      console.error("No email in checkout session:", session.id);
      return NextResponse.json({ received: true });
    }

    // Determine tier from line items
    let tag = "codify-paid";
    try {
      const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      if (priceId && PRICE_TO_TIER[priceId]) {
        tag = PRICE_TO_TIER[priceId];
      }
    } catch (err) {
      console.error("Failed to fetch line items:", err);
    }

    const name = session.customer_details?.name || "";

    try {
      const contactId = await upsertGhlContact(email, name, tag);
      console.log(`Stripe webhook: ${email} tagged ${tag}, GHL contact: ${contactId}`);
    } catch (err) {
      console.error("GHL upsert failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}
