import { NextResponse } from "next/server";

const GHL_API_URL = "https://rest.gohighlevel.com/v1/contacts/";
const GHL_API_KEY = process.env.GHL_API_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const res = await fetch(GHL_API_URL, {
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
        tags: ["codify-free-trial"],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("GHL API error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to create contact" },
        { status: 502 }
      );
    }

    const contact = await res.json();
    return NextResponse.json({ success: true, contactId: contact.contact?.id });
  } catch (err) {
    console.error("Lead capture error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
