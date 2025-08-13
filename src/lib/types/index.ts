/**
 * Core type definitions for the Qodda application
 */

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface SkinCondition {
  name: string
  confidence: number
  description?: string
  recommendedActions?: string[]
}

export interface ClassificationResult {
  id: string
  userId: string
  imageUrl: string
  imageName: string
  predictions: SkinCondition[]
  topPrediction: SkinCondition
  timestamp: Date
  processingTime: number
  metadata: {
    imageSize: number
    imageType: string
    deviceInfo?: string
  }
}

export interface UploadedImage {
  file: File
  preview: string
  name: string
  size: number
  type: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AzureCustomVisionPrediction {
  probability: number
  tagId: string
  tagName: string
  boundingBox?: {
    left: number
    top: number
    width: number
    height: number
  }
}

export interface AzureCustomVisionResponse {
  id: string
  project: string
  iteration: string
  created: string
  predictions: AzureCustomVisionPrediction[]
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

export interface AppInsightsEvent {
  name: string
  properties?: Record<string, any>
  measurements?: Record<string, number>
}
