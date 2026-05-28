"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const FOLLOW_RE = /^[a-zA-Z0-9._]{1,30}$/;

export async function updateInstagramUsername(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const raw = formData.get("username");
  if (typeof raw !== "string") {
    redirect("/settings?error=Username+is+required");
  }
  const username = raw.trim().replace(/^@/, "");
  if (!FOLLOW_RE.test(username)) {
    redirect(
      "/settings?error=Username+can+only+contain+letters%2C+numbers%2C+periods+and+underscores",
    );
  }

  try {
    await prisma.profile.update({
      where: { userId: data.claims.sub },
      data: { instagramUsername: username },
    });
  } catch {
    redirect("/settings?error=That+username+is+already+taken");
  }

  revalidatePath("/settings");
  revalidatePath("/");
  redirect("/settings?ok=1");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const userId = data.claims.sub;

  // Cascade-delete the Profile row (and via FK: Orders, Actions, Transactions).
  await prisma.profile
    .delete({ where: { userId } })
    .catch(() => {
      // Profile may not exist yet — that's fine.
    });

  // Wipe the Supabase auth user (requires service-role key in env).
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);
  } catch {
    // If the service-role key isn't set yet, fall back to signing the user
    // out. They'll be able to sign in again to recreate, but their profile
    // data is gone.
    await supabase.auth.signOut();
  }

  redirect("/login?deleted=1");
}
