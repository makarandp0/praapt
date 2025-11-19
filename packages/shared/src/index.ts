import { z } from 'zod';

// Common primitives
export const ImageName = z.string().trim().min(1, 'name required');
export type ImageName = z.infer<typeof ImageName>;

// Save image
export const SaveImageBodySchema = z.object({
  name: ImageName,
  image: z.string().min(1, 'image required'), // base64 or data URL
});
export type SaveImageBody = z.infer<typeof SaveImageBodySchema>;

export const SaveImageResponseSchema = z.object({
  ok: z.literal(true),
  name: z.string(),
  file: z.string(),
});
export type SaveImageResponse = z.infer<typeof SaveImageResponseSchema>;

// List images
export const ListImagesResponseSchema = z.object({
  ok: z.literal(true),
  images: z.array(z.string()),
  files: z.array(z.string()),
});
export type ListImagesResponse = z.infer<typeof ListImagesResponseSchema>;

// Compare images
export const CompareImagesBodySchema = z.object({
  a: ImageName,
  b: ImageName,
});
export type CompareImagesBody = z.infer<typeof CompareImagesBodySchema>;

export const CompareImagesResponseSchema = z.object({
  ok: z.literal(true),
  same: z.boolean(),
  algo: z.enum(['sha256', 'face-arcface']),
  a: z.string(),
  b: z.string(),
  distance: z.number().optional(),
  threshold: z.number().optional(),
});
export type CompareImagesResponse = z.infer<typeof CompareImagesResponseSchema>;

// Error response
export const ErrorResponseSchema = z.object({ error: z.string() });
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
