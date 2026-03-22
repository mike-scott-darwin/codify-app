import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Map GHL product IDs to app tiers
const PRODUCT_TIER_MAP: Record<string, string> = {
  "69bce9658eef3089bc4dc95c": "focus",   // Codify Build
  "69bce96c806bfe4141eae56d": "focus",     // Codify Pro
  "69bce96dadd325142185b3a7": "brain_sync",  // Codify Agency
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service role config");
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const body = await request.json();
    const eventType = body.type || body.event;

    const contactEmail = body.contact?.email || body.email || body.data?.email;
    const productId = body.product?.id || body.data?.product_id;

    if (!contactEmail) {
      console.error("GHL webhook: no email in payload", JSON.stringify(body).slice(0, 500));
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    if (eventType === "order.completed" || eventType === "payment_received" || eventType === "invoice.paid") {
      const tier = productId ? PRODUCT_TIER_MAP[productId] : null;
      if (!tier) {
        console.error("GHL webhook: unknown product", productId);
        return NextResponse.json({ error: "Unknown product" }, { status: 400 });
      }

      // Find user by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(
        (u) => u.email?.toLowerCase() === contactEmail.toLowerCase()
      );

      if (!user) {
        // Store pending upgrade for when they sign up
        await supabase.from("pending_upgrades").upsert({
          email: contactEmail.toLowerCase(),
          tier,
          ghl_product_id: productId,
          payload: body,
          created_at: new Date().toISOString(),
        }, { onConflict: "email" });

        console.log(`GHL webhook: pending upgrade stored for ${contactEmail} → ${tier}`);
        return NextResponse.json({ status: "pending", message: "User not found, upgrade queued" });
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ tier })
        .eq("user_id", user.id);

      if (error) {
        console.error("GHL webhook: failed to update tier", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      console.log(`GHL webhook: ${contactEmail} upgraded to ${tier}`);
      return NextResponse.json({ status: "ok", email: contactEmail, tier });
    }

    if (eventType === "subscription.cancelled" || eventType === "order.refunded") {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(
        (u) => u.email?.toLowerCase() === contactEmail.toLowerCase()
      );

      if (user) {
        await supabase
          .from("user_profiles")
          .update({ tier: "free" })
          .eq("user_id", user.id);
        console.log(`GHL webhook: ${contactEmail} downgraded to free`);
      }

      return NextResponse.json({ status: "ok", action: "downgraded" });
    }

    console.log(`GHL webhook: unhandled event "${eventType}"`);
    return NextResponse.json({ status: "ignored", eventType });
  } catch (err) {
    console.error("GHL webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
