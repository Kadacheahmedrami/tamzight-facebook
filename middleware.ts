// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If user is authenticated, allow the request to continue
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has a valid token (is authenticated)
        return !!token
      },
    },
    pages: {
      signIn: "/auth/login", // Redirect unauthenticated users here
    },
  }
)

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    "/main/:path*",     // Protects /main and all sub-routes
    "/api/main/:path*", // Protects /api/main and all sub-routes
  ]
}