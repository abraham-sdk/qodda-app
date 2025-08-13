/**
 * Server-side logging service for Next.js
 * Simplified logging without Azure Functions dependencies
 */
class ServerLogger {
  private initialized = false

  /**
   * Initialize server-side logging
   */
  initialize() {
    if (this.initialized) return

    const connectionString = process.env.AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING
    if (!connectionString) {
      console.warn("Application Insights connection string not found for server logging")
      return
    }

    // Using simple console logging with structured format for production
    this.initialized = true
    console.log("Server logger initialized")
  }

  /**
   * Log information
   */
  info(message: string, properties?: Record<string, any>) {
    const logEntry = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      properties,
    }
    console.log(JSON.stringify(logEntry))
  }

  /**
   * Log warnings
   */
  warn(message: string, properties?: Record<string, any>) {
    const logEntry = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      properties,
    }
    console.warn(JSON.stringify(logEntry))
  }

  /**
   * Log errors
   */
  error(message: string, error?: Error, properties?: Record<string, any>) {
    const logEntry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      properties,
    }
    console.error(JSON.stringify(logEntry))
  }

  /**
   * Track custom events
   */
  trackEvent(name: string, properties?: Record<string, any>, measurements?: Record<string, number>) {
    const logEntry = {
      level: "event",
      event: name,
      timestamp: new Date().toISOString(),
      properties,
      measurements,
    }
    console.log(JSON.stringify(logEntry))
  }

  /**
   * Track API requests
   */
  trackRequest(
    name: string,
    url: string,
    duration: number,
    resultCode: string,
    success: boolean,
    properties?: Record<string, any>,
  ) {
    const logEntry = {
      level: "request",
      name,
      url,
      duration,
      resultCode,
      success,
      timestamp: new Date().toISOString(),
      properties,
    }
    console.log(JSON.stringify(logEntry))
  }

  /**
   * Track dependencies
   */
  trackDependency(name: string, data: string, duration: number, success: boolean, dependencyTypeName?: string) {
    const logEntry = {
      level: "dependency",
      name,
      data,
      duration,
      success,
      dependencyTypeName: dependencyTypeName || "HTTP",
      timestamp: new Date().toISOString(),
    }
    console.log(JSON.stringify(logEntry))
  }

  /**
   * Flush telemetry data (no-op for console logging)
   */
  flush() {
    // No-op for console logging
  }
}

export const serverLogger = new ServerLogger()
