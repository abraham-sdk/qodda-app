import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import { ReactPlugin } from "@microsoft/applicationinsights-react-js"

/**
 * Azure Application Insights service for client-side telemetry
 */
class AppInsightsService {
  private appInsights: ApplicationInsights | null = null
  private reactPlugin: ReactPlugin | null = null

  /**
   * Initialize Application Insights
   */
  initialize() {
    if (typeof window === "undefined") return

    const connectionString = process.env.NEXT_PUBLIC_AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING
    if (!connectionString) {
      console.warn("Application Insights connection string not found")
      return
    }

    this.reactPlugin = new ReactPlugin()
    this.appInsights = new ApplicationInsights({
      config: {
        connectionString,
        extensions: [this.reactPlugin],
        extensionConfig: {
          [this.reactPlugin.identifier]: {},
        },
      },
    })

    this.appInsights.loadAppInsights()
  }

  /**
   * Track custom events
   */
  trackEvent(name: string, properties?: Record<string, any>) {
    if (this.appInsights) {
      this.appInsights.trackEvent({ name }, properties)
    }
  }

  /**
   * Track exceptions
   */
  trackException(error: Error, properties?: Record<string, any>) {
    if (this.appInsights) {
      this.appInsights.trackException({ exception: error }, properties)
    }
  }

  /**
   * Track page views
   */
  trackPageView(name: string, url?: string) {
    if (this.appInsights) {
      this.appInsights.trackPageView({ name, uri: url })
    }
  }

  /**
   * Track dependencies (API calls)
   */
  trackDependency(name: string, data: string, duration: number, success: boolean) {
    if (this.appInsights) {
      this.appInsights.trackDependencyData({
        name,
        data,
        duration,
        success,
        id: Math.random().toString(36),
      } as any)
    }
  }

  /**
   * Get React plugin for router integration
   */
  getReactPlugin() {
    return this.reactPlugin
  }
}

export const appInsights = new AppInsightsService()
