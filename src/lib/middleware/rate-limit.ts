import { type NextRequest, NextResponse } from "next/server"
import { serverLogger } from "@/src/lib/services/server-logger"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

/**
 * In-memory rate limiting store
 * In production, consider using Redis for distributed rate limiting
 */
const store: RateLimitStore = {}

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

/**
 * Default rate limit configuration
 */
const defaultConfig: RateLimitConfig = {
  maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Try to get user ID from auth header or use IP address
  const authHeader = request.headers.get("authorization")
  if (authHeader) {
    // Extract user ID from JWT token (simplified)
    try {
      const token = authHeader.replace("Bearer ", "")
      const payload = JSON.parse(atob(token.split(".")[1]))
      return `user:${payload.sub || payload.oid}`
    } catch {
      // Fall back to IP
    }
  }

  // Use IP address as fallback
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
  return `ip:${ip}`
}

/**
 * Clean up expired entries from the store
 */
function cleanupStore() {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

/**
 * Rate limiting middleware
 */
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const clientId = getClientId(request)
    const now = Date.now()
    const windowStart = now - finalConfig.windowMs

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance
      cleanupStore()
    }

    // Get or create client record
    if (!store[clientId] || store[clientId].resetTime < now) {
      store[clientId] = {
        count: 0,
        resetTime: now + finalConfig.windowMs,
      }
    }

    const clientRecord = store[clientId]

    // Check if limit exceeded
    if (clientRecord.count >= finalConfig.maxRequests) {
      const resetTime = new Date(clientRecord.resetTime)

      serverLogger.warn("Rate limit exceeded", {
        clientId,
        path: request.nextUrl.pathname,
        method: request.method,
        count: clientRecord.count,
        limit: finalConfig.maxRequests,
        resetTime: resetTime.toISOString(),
      })

      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((clientRecord.resetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": finalConfig.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": clientRecord.resetTime.toString(),
            "Retry-After": Math.ceil((clientRecord.resetTime - now) / 1000).toString(),
          },
        },
      )
    }

    // Increment counter
    clientRecord.count++

    // Add rate limit headers to response (will be added by the calling code)
    return null // Continue processing
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  clientId: string,
  config: RateLimitConfig = defaultConfig,
): NextResponse {
  const clientRecord = store[clientId]
  if (clientRecord) {
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", Math.max(0, config.maxRequests - clientRecord.count).toString())
    response.headers.set("X-RateLimit-Reset", clientRecord.resetTime.toString())
  }
  return response
}
