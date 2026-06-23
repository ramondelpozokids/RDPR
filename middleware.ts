// middleware.ts — Edge: solo auth.config (sin Prisma)
import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth/auth.config"
import { isPublicRegistrationEnabled } from "@/lib/auth/registration"

const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req) {
  const { pathname, searchParams } = req.nextUrl
  const session = req.auth

  if (pathname === "/register" && !isPublicRegistrationEnabled(searchParams.get("invite"))) {
    const login = new URL("/login", req.url)
    login.searchParams.set("registro", "cerrado")
    return NextResponse.redirect(login)
  }

  if (pathname.startsWith("/portal") || pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/login", "/register"],
}
