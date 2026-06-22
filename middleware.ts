// middleware.ts
import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"
import { hasPortalAccess, isPortalOnlyUser } from "@/lib/portal/context"

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl
  const session = req.auth
  const userId = session?.user?.id

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
