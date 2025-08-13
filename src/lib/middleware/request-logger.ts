import type { NextRequest, NextResponse } from "next/server"
import { serverLogger } from "@/src/lib/services/server-logger"

/**
 * Request logging middleware
 */
export async function logRequest(request: NextRequest, response: NextResponse) {
  const startTime = Date.now()
  const method = request.method
  const url = request.nextUrl.pathname + request.nextUrl.search
  const userAgent = request.headers.get("user-agent") || "unknown"
  const referer = request.headers.get("referer") || ""
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "unknown"

  // Log the request
  serverLogger.info("API Request", {
    method,
    url,
    userAgent,
    referer,
    ip,
    timestamp: new Date().toISOString(),
  })

  // Track the request in Application Insights
  const duration = Date.now() - startTime
  const success = response.status < 400

  serverLogger.trackRequest(`${method} ${url}`, url, duration, response.status.toString(), success, {
    method,
    userAgent,
    ip,
  })

  return response
}

/**
 * Error logging middleware
 */
export function logError(error: Error, request: NextRequest, context?: Record<string, any>) {
  const method = request.method
  const url = request.nextUrl.pathname + request.nextUrl.search
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "unknown"

  serverLogger.error("API Error", error, {
    method,
    url,
    ip,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  })
}
