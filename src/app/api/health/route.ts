import { type NextRequest, NextResponse } from "next/server"
import { serverLogger } from "@/src/lib/services/server-logger"
import { cosmosService } from "@/src/lib/services/cosmos-db"

/**
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks: {
        database: "unknown",
        storage: "unknown",
        customVision: "unknown",
      },
    }

    // Check database connectivity
    try {
      await cosmosService.initialize()
      health.checks.database = "healthy"
    } catch (error) {
      health.checks.database = "unhealthy"
      health.status = "degraded"
    }

    // Check Azure Blob Storage
    try {
      if (process.env.AZURE_STORAGE_ACCOUNT_NAME && process.env.AZURE_STORAGE_ACCOUNT_KEY) {
        health.checks.storage = "healthy"
      } else {
        health.checks.storage = "not_configured"
      }
    } catch (error) {
      health.checks.storage = "unhealthy"
      health.status = "degraded"
    }

    // Check Custom Vision API
    try {
      if (process.env.AZURE_CUSTOM_VISION_ENDPOINT && process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY) {
        health.checks.customVision = "healthy"
      } else {
        health.checks.customVision = "not_configured"
      }
    } catch (error) {
      health.checks.customVision = "unhealthy"
      health.status = "degraded"
    }

    const duration = Date.now() - startTime

    serverLogger.trackRequest("GET /api/health", "/api/health", duration, "200", true, { healthStatus: health.status })

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    const duration = Date.now() - startTime

    serverLogger.error("Health check failed", error as Error)
    serverLogger.trackRequest("GET /api/health", "/api/health", duration, "500", false)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 },
    )
  }
}
