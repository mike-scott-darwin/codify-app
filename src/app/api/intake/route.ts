import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const SCAN_WEBHOOK_URL = process.env.SCAN_WEBHOOK_URL || "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const token = formData.get("token") as string;
    if (!token) {
      return NextResponse.json({ error: "Invalid link" }, { status: 400 });
    }

    // Parse text answers
    let answers: Record<string, string> = {};
    try {
      answers = JSON.parse((formData.get("answers") as string) || "{}");
    } catch {
      // ignore parse errors
    }

    // Build combined answer text
    const parts: string[] = [];
    if (answers?.identity) parts.push(`What I do: ${answers.identity}`);
    if (answers?.contrarian)
      parts.push(`What my industry gets wrong: ${answers.contrarian}`);
    if (answers?.style) parts.push(`My style: ${answers.style}`);
    if (answers?.origin) parts.push(`Why I started: ${answers.origin}`);

    // Handle voice note upload
    let voiceNote: { url: string; duration: number } | null = null;
    const voice = formData.get("voiceNote") as File | null;
    if (voice && voice.size > 0) {
      const blob = await put(
        `intake/${Date.now()}-voice.webm`,
        voice,
        { access: "public" }
      );
      voiceNote = {
        url: blob.url,
        duration: parseInt(
          (formData.get("voiceDuration") as string) || "0"
        ),
      };
    }

    if (parts.length === 0 && !voiceNote) {
      return NextResponse.json(
        { error: "Please answer at least one question or record a voice note" },
        { status: 400 }
      );
    }

    const combinedAnswers = parts.join("\n\n");

    // Forward to Mac Mini webhook receiver
    if (SCAN_WEBHOOK_URL) {
      const url = new URL(SCAN_WEBHOOK_URL.replace(/\/+$/, ""));
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
            voiceNote,
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
