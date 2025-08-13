/**
 * Input validation schemas and utilities using Zod
 */

import { z } from "zod"

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "File must be a JPEG, PNG, or WebP image",
    ),
})

export const classificationRequestSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  userId: z.string().min(1, "User ID is required"),
  metadata: z
    .object({
      imageSize: z.number().positive(),
      imageType: z.string(),
      deviceInfo: z.string().optional(),
    })
    .optional(),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
})

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  try {
    imageUploadSchema.parse({ file })
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error?.errors?.[0]?.message }
    }
    return { isValid: false, error: "Invalid file" }
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase()
}
