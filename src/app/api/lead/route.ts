import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const GHL_API_URL = "https://rest.gohighlevel.com/v1/contacts/";
const GHL_API_KEY = process.env.GHL_API_KEY!;
const SCAN_WEBHOOK_URL = process.env.SCAN_WEBHOOK_URL || "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Business answers
    const answers = {
      business: (formData.get("business") as string) || "",
      audience: (formData.get("audience") as string) || "",
      differentiator: (formData.get("differentiator") as string) || "",
      challenge: (formData.get("challenge") as string) || "",
    };

    // Upload file to Vercel Blob (if provided)
    const uploads: Array<{ filename: string; url: string; type: string }> = [];
    const file = formData.get("file") as File | null;
    if (file && file.size > 0) {
      const blob = await put(`scans/${Date.now()}-${file.name}`, file, {
        access: "public",
      });
      uploads.push({
        filename: file.name,
        url: blob.url,
        type: file.type,
      });
    }

    // Upload voice note to Vercel Blob (if provided)
    let voiceNote: { url: string; duration: number } | null = null;
    const voice = formData.get("voiceNote") as File | null;
    if (voice && voice.size > 0) {
      const blob = await put(`scans/${Date.now()}-voice.webm`, voice, {
        access: "public",
      });
      voiceNote = {
        url: blob.url,
        duration: parseInt((formData.get("voiceDuration") as string) || "0"),
      };
    }

    // Create GHL contact
    const businessSummary = [
      answers.business,
      answers.audience && `Audience: ${answers.audience}`,
      answers.differentiator && `Differentiator: ${answers.differentiator}`,
      answers.challenge && `Challenge: ${answers.challenge}`,
    ]
      .filter(Boolean)
      .join("\n");

    const ghlRes = await fetch(GHL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        source: "codify.build/get-started",
        tags: ["opportunity-scan", "website"],
        customField: {
          business_summary: businessSummary,
        },
      }),
    });

    let ghlContactId = "";
    if (ghlRes.ok) {
      const ghlData = await ghlRes.json();
      ghlContactId = ghlData.contact?.id || "";
    } else {
      console.error("GHL API error:", ghlRes.status, await ghlRes.text());
    }

    // Build scan job
    const jobId = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job = {
      id: jobId,
      created: new Date().toISOString(),
      status: "pending",
      contact: {
        firstName,
        lastName,
        email,
        phone,
        ghlContactId,
      },
      input: {
        answers,
        uploads,
        voiceNote,
        inputMode: (formData.get("inputMode") as string) || "write",
      },
    };

    // Send job to Mac Mini webhook
    if (SCAN_WEBHOOK_URL) {
      try {
        await fetch(SCAN_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(WEBHOOK_SECRET && { "X-Webhook-Secret": WEBHOOK_SECRET }),
          },
          body: JSON.stringify(job),
        });
      } catch (err) {
        console.error("Webhook delivery failed:", err);
        // Don't fail the request — job can be retried
      }
    }

    return NextResponse.json({ success: true, jobId, contactId: ghlContactId });
  } catch (err) {
    console.error("Lead capture error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
