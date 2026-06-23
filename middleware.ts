// middleware.ts — sin Prisma (Edge no lo soporta)
import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"
import { isPublicRegistrationEnabled } from "@/lib/auth/registration"

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

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/login", "/register"],
}
