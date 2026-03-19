// Required env vars:
// GITHUB_CLIENT_ID=xxx
// GITHUB_CLIENT_SECRET=xxx
// NEXT_PUBLIC_APP_URL=http://localhost:3000

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Validate params
  if (!code || !state) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=missing_params`
    );
  }

  // Verify state matches cookie
  const cookieStore = await cookies();
  const savedState = cookieStore.get("github_oauth_state")?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=invalid_state`
    );
  }

  // Clear the state cookie
  cookieStore.delete("github_oauth_state");

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=token_exchange_failed`
    );
  }

  const tokenData = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=token_denied`
    );
  }

  const accessToken = tokenData.access_token;

  // Get the user's GitHub username
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=user_fetch_failed`
    );
  }

  const userData = await userRes.json();
  const githubUsername = userData.login;

  // Save token + owner to Supabase user_profiles
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?error=not_authenticated`
    );
  }

  // Save partial config — repo gets set when they name their workspace
  const { error } = await supabase
    .from("user_profiles")
    .upsert({
      user_id: user.id,
      github_config: {
        token: accessToken,
        owner: githubUsername,
      },
    }, { onConflict: "user_id" });

  if (error) {
    return NextResponse.redirect(
      `${origin}/onboarding?error=save_failed`
    );
  }

  return NextResponse.redirect(`${origin}/onboarding?github=connected`);
}
