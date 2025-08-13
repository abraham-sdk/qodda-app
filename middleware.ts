import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/src/lib/middleware/rate-limit"
import { logRequest, logError } from "@/src/lib/middleware/request-logger"
import { serverLogger } from "@/src/lib/services/server-logger"

// Initialize server logger
serverLogger.initialize()

/**
 * Middleware configuration
 */
export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Skip middleware for static files and internal Next.js routes
    if (
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.includes("/favicon.ico") ||
      request.nextUrl.pathname.includes("/robots.txt")
    ) {
      return NextResponse.next()
    }

    // Apply rate limiting to API routes
    if (request.nextUrl.pathname.startsWith("/api")) {
      let rateLimitConfig = {}

      if (request.nextUrl.pathname.includes("/classify")) {
        // Stricter limits for AI classification
        rateLimitConfig = { maxRequests: 10, windowMs: 900000 } // 10 requests per 15 minutes
      } else if (request.nextUrl.pathname.includes("/upload")) {
        // Moderate limits for uploads
        rateLimitConfig = { maxRequests: 20, windowMs: 900000 } // 20 requests per 15 minutes
      }

      const rateLimitResponse = await rateLimit(rateLimitConfig)(request)
      if (rateLimitResponse) {
        return rateLimitResponse
      }
    }

    // Continue with the request
    const response = NextResponse.next()

    // Add security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    // Log the request for API routes
    if (request.nextUrl.pathname.startsWith("/api")) {
      await logRequest(request, response)
    }

    return response
  } catch (error) {
    logError(error as Error, request, { middleware: true })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
