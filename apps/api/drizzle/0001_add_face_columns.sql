-- Add face recognition columns to users table
ALTER TABLE "users" ADD COLUMN "face_embedding" jsonb;
ALTER TABLE "users" ADD COLUMN "profile_image_path" text;
ALTER TABLE "users" ADD COLUMN "face_registered_at" timestamp with time zone;
