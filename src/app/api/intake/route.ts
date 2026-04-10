import { NextResponse } from "next/server";

const SCAN_WEBHOOK_URL = process.env.SCAN_WEBHOOK_URL || "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, answers } = body;

    if (!token) {
      return NextResponse.json({ error: "Invalid link" }, { status: 400 });
    }

    // Build combined answer text
    const parts: string[] = [];
    if (answers?.identity) parts.push(`What I do: ${answers.identity}`);
    if (answers?.contrarian)
      parts.push(`What my industry gets wrong: ${answers.contrarian}`);
    if (answers?.style) parts.push(`My style: ${answers.style}`);
    if (answers?.origin) parts.push(`Why I started: ${answers.origin}`);

    if (parts.length === 0) {
      return NextResponse.json(
        { error: "Please answer at least one question" },
        { status: 400 }
      );
    }

    const combinedAnswers = parts.join("\n\n");

    // Forward to Mac Mini webhook receiver
    if (SCAN_WEBHOOK_URL) {
      // Reuse the same host but hit port 9000 for the webhook receiver
      const baseUrl = SCAN_WEBHOOK_URL.replace(/\/+$/, "");
      const url = new URL(baseUrl);
      url.port = "9000";
      url.pathname = "/intake";

      try {
        await fetch(url.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(WEBHOOK_SECRET && { "X-Webhook-Secret": WEBHOOK_SECRET }),
          },
          body: JSON.stringify({
            token,
            answers: combinedAnswers,
            raw: answers,
            submitted: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Intake webhook delivery failed:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Intake API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
