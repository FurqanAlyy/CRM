import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const AUTH_SECRET = process.env.AUTH_SECRET

if (!AUTH_SECRET) {
  throw new Error("Please define AUTH_SECRET in .env.local")
}

const secret = new TextEncoder().encode(AUTH_SECRET)

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    await jwtVerify(token, secret)

    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    )

    response.cookies.delete("auth_token")

    return response
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/contacts/:path*",
    "/companies/:path*",
    "/leads/:path*",
    "/deals/:path*",
    "/tasks/:path*",
    "/activities/:path*",
    "/reports/:path*",
    "/ai/:path*",
    "/settings/:path*"
  ]
}