import {
  CompareImagesBody,
  CompareImagesBodySchema,
  CompareImagesResponse,
  CompareImagesResponseSchema,
  HealthResponse,
  HealthResponseSchema,
  ListImagesResponse,
  ListImagesResponseSchema,
  SaveImageBody,
  SaveImageBodySchema,
  SaveImageResponse,
  SaveImageResponseSchema,
} from '@praapt/shared';

/**
 * Type-safe API client for the Praapt API.
 * All methods validate requests and responses using Zod schemas.
 */
export class ApiClient {
  constructor(private baseUrl: string) {}

  /**
   * Check health status of API and face service
   */
  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    const data = await response.json();
    return HealthResponseSchema.parse(data);
  }

  /**
   * Load a face recognition model
   */
  async loadModel(model: 'buffalo_l' | 'buffalo_s'): Promise<{
    ok: boolean;
    message: string;
    model: string;
  }> {
    const response = await fetch(`${this.baseUrl}/load-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Failed to load model');
    }

    return response.json();
  }

  /**
   * Save an image with a name
   */
  async saveImage(body: SaveImageBody): Promise<SaveImageResponse> {
    // Validate request body
    const validatedBody = SaveImageBodySchema.parse(body);

    const response = await fetch(`${this.baseUrl}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Failed to save image');
    }

    const data = await response.json();
    return SaveImageResponseSchema.parse(data);
  }

  /**
   * List all saved images
   */
  async listImages(): Promise<ListImagesResponse> {
    const response = await fetch(`${this.baseUrl}/images`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Failed to list images');
    }

    const data = await response.json();
    return ListImagesResponseSchema.parse(data);
  }

  /**
   * Get image URL by name
   */
  getImageUrl(name: string): string {
    return `${this.baseUrl}/images/${encodeURIComponent(name)}`;
  }

  /**
   * Compare two images by name
   */
  async compareImages(body: CompareImagesBody): Promise<CompareImagesResponse> {
    // Validate request body
    const validatedBody = CompareImagesBodySchema.parse(body);

    const response = await fetch(`${this.baseUrl}/images/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || 'Failed to compare images');
    }

    const data = await response.json();
    return CompareImagesResponseSchema.parse(data);
  }
}

/**
 * Create an API client instance with the given base URL
 */
export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient(baseUrl);
}
