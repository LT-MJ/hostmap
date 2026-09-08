"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error: string | null };

/**
 * Sign-in attempt rate limiting (§65) is enforced by Supabase Auth itself
 * at the platform level (it rate-limits password grant attempts per
 * project) — this app has no additional application-level limiter here
 * because there's nothing for it to add over what Supabase already does
 * for this exact endpoint. A limiter belongs on forms this app owns end to
 * end (contact/support forms, once built) where no such built-in exists.
 */
export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
