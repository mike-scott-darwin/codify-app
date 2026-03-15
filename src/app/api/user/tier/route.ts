import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ tier: "free", enrichmentCount: 0, generationCount: 0 });
    }

    // Get user profile (tier)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("tier")
      .eq("user_id", user.id)
      .single();

    // Get enrichment count
    const { count: enrichmentCount } = await supabase
      .from("enrichment_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get generation count (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: generationCount } = await supabase
      .from("generation_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    return NextResponse.json({
      tier: profile?.tier || "free",
      enrichmentCount: enrichmentCount || 0,
      generationCount: generationCount || 0,
    });
  } catch {
    return NextResponse.json({ tier: "free", enrichmentCount: 0, generationCount: 0 });
  }
}
