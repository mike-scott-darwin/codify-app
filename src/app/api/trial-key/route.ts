import { NextResponse } from "next/server";

const GHL_API_URL = "https://rest.gohighlevel.com/v1/contacts/lookup";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Verify this email exists in GHL as a trial signup
    const ghlRes = await fetch(
      `${GHL_API_URL}?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${process.env.GHL_API_KEY!}` },
      }
    );

    if (!ghlRes.ok) {
      return NextResponse.json(
        { error: "Not a registered trial user" },
        { status: 403 }
      );
    }

    const ghlData = await ghlRes.json();
    if (!ghlData.contacts?.length) {
      return NextResponse.json(
        { error: "Not a registered trial user" },
        { status: 403 }
      );
    }

    const trialKey = process.env.TRIAL_OPENROUTER_KEY;
    if (!trialKey) {
      return NextResponse.json(
        { error: "Trial not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      apiKey: trialKey,
      baseUrl: "https://openrouter.ai/api/v1",
      model: "qwen/qwen3-coder",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
