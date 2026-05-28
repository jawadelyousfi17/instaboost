import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data } = await supabase.auth.getClaims();
      const base =
        request.headers.get("x-forwarded-host")
          ? `https://${request.headers.get("x-forwarded-host")}`
          : origin;

      if (data?.claims) {
        const profile = await prisma.profile.findUnique({
          where: { userId: data.claims.sub },
        });
        return NextResponse.redirect(
          `${base}${profile ? "/" : "/onboarding"}`,
        );
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
