import { type NextRequest, NextResponse } from "next/server";
import { logError } from "@/src/lib/middleware/request-logger";
import { serverLogger } from "@/src/lib/services/server-logger";
import { User } from "@/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const user = request.headers.get("user") as User; // Assuming user is extracted from headers
  const imageUrl = request.headers.get("image-url"); // Assuming imageUrl is extracted from headers
  const predictions: any[] = []; // Assuming predictions are initialized
  const result = { id: "123" }; // Assuming result is initialized

  try {
    serverLogger.info("Classification request started", {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    });

    serverLogger.trackEvent("skin_classification_completed", {
      userId: user?.oid,
      imageUrl,
      predictionsCount: predictions.length,
      topPredictionTag: predictions[0]?.tagName,
      topPredictionProbability: predictions[0]?.probability,
      duration: Date.now() - startTime,
    });

    serverLogger.info("Classification completed successfully", {
      userId: user?.oid,
      predictionsCount: predictions.length,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      predictions,
      classificationId: result.id,
    });
  } catch (error) {
    logError(error as Error, request, {
      endpoint: "/api/classify",
      userId: user?.oid,
      duration: Date.now() - startTime,
    });

    serverLogger.trackEvent("skin_classification_failed", {
      userId: user?.oid,
      error: (error as Error).message,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Classification failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
