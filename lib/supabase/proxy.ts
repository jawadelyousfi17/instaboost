import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: keep `getClaims()` here. It refreshes the session and
  // validates the JWT signature — never trust `getSession()` on the server.
  // IMPORTANT: do not run code between `createServerClient` and
  // `getClaims()` — a buggy session can be hard to debug otherwise.
  const { data } = await supabase.auth.getClaims();

  // Redirect unauthenticated users away from protected routes here if needed.
  // Example:
  // if (!data?.claims && !request.nextUrl.pathname.startsWith("/login")) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  void data;

  return supabaseResponse;
}
