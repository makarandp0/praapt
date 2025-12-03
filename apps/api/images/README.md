# Seed Images

This directory contains seed images that will be included in the Docker image.

## Adding Seed Images

To pre-populate slots with images:

1. Add JPEG images to this directory with the naming format: `slot-01.jpg`, `slot-02.jpg`, etc.
2. Valid slot numbers are 01-08 (matching the MAX_IMAGES in the frontend)
3. Images must be JPEG format (`.jpg` extension)

Example:

```
apps/api/images/
  slot-01.jpg  # Will appear in slot 1
  slot-02.jpg  # Will appear in slot 2
  slot-03.jpg  # Will appear in slot 3
```

## Production Behavior

- These images are copied into the Docker container at build time
- They appear as the initial images when the app starts
- Users can replace them by capturing/uploading new images
- The IMAGES_DIR environment variable controls where images are stored at runtime (defaults to ./images)
