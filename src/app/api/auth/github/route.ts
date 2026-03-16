// Required env vars:
// GITHUB_CLIENT_ID=xxx
// GITHUB_CLIENT_SECRET=xxx
// NEXT_PUBLIC_APP_URL=http://localhost:3000

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured" },
      { status: 500 }
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Generate random state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in httpOnly cookie (5 min expiry)
  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 minutes
    path: "/",
  });

  const redirectUri = `${origin}/api/auth/github/callback`;
  const githubUrl = new URL("https://github.com/login/oauth/authorize");
  githubUrl.searchParams.set("client_id", clientId);
  githubUrl.searchParams.set("redirect_uri", redirectUri);
  githubUrl.searchParams.set("scope", "repo");
  githubUrl.searchParams.set("state", state);

  return NextResponse.redirect(githubUrl.toString());
}
