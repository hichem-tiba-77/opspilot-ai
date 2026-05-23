import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth — Set the auth token cookie
 */
export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "Token is required" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });

  // NOTE: secure:true only works over HTTPS. Set NEXT_PUBLIC_SECURE_COOKIES=true
  // when deploying behind a TLS terminating proxy. Do NOT set it for local Docker.
  const isSecure = process.env.NEXT_PUBLIC_SECURE_COOKIES === "true";

  response.cookies.set("auth_token", token, {
    httpOnly: false, // must be false so client-side authHeader() can read it
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}

/**
 * DELETE /api/auth — Clear the auth token cookie (logout)
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  const isSecure = process.env.NEXT_PUBLIC_SECURE_COOKIES === "true";

  response.cookies.set("auth_token", "", {
    httpOnly: false,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
