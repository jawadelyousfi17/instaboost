import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const base = getAppUrl();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data } = await supabase.auth.getClaims();
      if (data?.claims) {
        const profile = await prisma.profile.findUnique({
          where: { userId: data.claims.sub },
        });
        return NextResponse.redirect(`${base}${profile ? "/" : "/onboarding"}`);
      }
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth_callback_failed`);
}
