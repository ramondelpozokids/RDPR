// middleware.ts
import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"
import { hasPortalAccess, isPortalOnlyUser } from "@/lib/portal/context"
import { isPublicRegistrationEnabled } from "@/lib/auth/registration"

export default auth(async function middleware(req) {
  const { pathname, searchParams } = req.nextUrl
  const session = req.auth
  const userId = session?.user?.id

  if (pathname === "/register" && !isPublicRegistrationEnabled(searchParams.get("invite"))) {
    const login = new URL("/login", req.url)
    login.searchParams.set("registro", "cerrado")
    return NextResponse.redirect(login)
  }

  if (pathname.startsWith("/portal")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (userId && !(await hasPortalAccess(userId))) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (userId && (await isPortalOnlyUser(userId))) {
      return NextResponse.redirect(new URL("/portal/documentos", req.url))
    }
  }

  if ((pathname === "/login" || pathname === "/register") && session && userId) {
    if (await isPortalOnlyUser(userId)) {
      return NextResponse.redirect(new URL("/portal/documentos", req.url))
    }
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/login", "/register"],
}
