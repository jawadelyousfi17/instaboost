"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const INSTAGRAM_USERNAME_RE = /^[a-zA-Z0-9._]{1,30}$/;

export async function saveInstagramUsername(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const raw = (formData.get("username") as string | null)?.trim() ?? "";

  if (!raw) {
    redirect("/onboarding?error=Username+is+required");
  }

  if (!INSTAGRAM_USERNAME_RE.test(raw)) {
    redirect(
      "/onboarding?error=Username+can+only+contain+letters%2C+numbers%2C+periods+and+underscores+%281%E2%80%9330+chars%29",
    );
  }

  const username = raw.replace(/^@/, "");

  try {
    await prisma.profile.upsert({
      where: { userId: data.claims.sub },
      create: {
        userId: data.claims.sub,
        instagramUsername: username,
      },
      update: {
        instagramUsername: username,
      },
    });
  } catch {
    redirect("/onboarding?error=That+username+is+already+taken");
  }

  redirect("/");
}
