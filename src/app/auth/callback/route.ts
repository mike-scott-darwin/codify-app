import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const response = NextResponse.redirect(`${origin}/onboarding`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // If GitHub OAuth, save the provider token to user_profiles
    if (data?.session?.provider_token && data?.user) {
      const providerToken = data.session.provider_token;

      // Get GitHub username from the user metadata
      const githubUsername =
        data.user.user_metadata?.user_name ||
        data.user.user_metadata?.preferred_username ||
        "";

      if (githubUsername) {
        // Check if user already has a github_config with a repo
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("github_config")
          .eq("id", data.user.id)
          .single();

        const existingConfig = (profile?.github_config as Record<string, string> | null) || {};

        await supabase
          .from("user_profiles")
          .upsert({
            id: data.user.id,
            email: data.user.email,
            github_config: {
              ...existingConfig,
              token: providerToken,
              owner: githubUsername,
            },
          });
      }
    }

    return response;
  }

  return NextResponse.redirect(`${origin}/`);
}
