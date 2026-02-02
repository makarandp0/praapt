import {
  Contracts,
  type CompareImagesBody,
  type CompareImagesResponse,
  type HealthResponse,
  type ListImagesResponse,
  type ListUsersResponse,
  type LoginBody,
  type LoginResponse,
  type SaveImageBody,
  type SaveImageResponse,
  type SignupBody,
  type SignupResponse,
  type LoadModelBody,
  type LoadModelResponse,
} from '@praapt/shared';

import { callContract } from './contractClient.js';

// Re-export types for convenience
export type {
  ListUsersResponse,
  LoginResponse,
  SignupResponse,
  HealthResponse,
  ListImagesResponse,
  SaveImageResponse,
  CompareImagesResponse,
  LoadModelResponse,
} from '@praapt/shared';

/**
 * Type-safe API client for the Praapt API.
 * Uses contract-based calls for automatic validation.
 */
export class ApiClient {
  constructor(private baseUrl: string) {}

  /**
   * Check health status of API and face service
   */
  async getHealth(): Promise<HealthResponse> {
    return callContract(this.baseUrl, Contracts.getHealth);
  }

  /**
   * Load a face recognition model
   */
  async loadModel(model: LoadModelBody['model']): Promise<LoadModelResponse> {
    return callContract(this.baseUrl, Contracts.loadModel, {
      body: { model },
    });
  }

  /**
   * Sign up a new user
   */
  async signup(body: SignupBody): Promise<SignupResponse> {
    return callContract(this.baseUrl, Contracts.signup, { body });
  }

  /**
   * Login with face recognition
   */
  async login(body: LoginBody): Promise<LoginResponse> {
    return callContract(this.baseUrl, Contracts.login, { body });
  }

  /**
   * Save an image with a name
   */
  async saveImage(body: SaveImageBody): Promise<SaveImageResponse> {
    return callContract(this.baseUrl, Contracts.saveImage, { body });
  }

  /**
   * List all saved images
   */
  async listImages(): Promise<ListImagesResponse> {
    return callContract(this.baseUrl, Contracts.listImages);
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
    return callContract(this.baseUrl, Contracts.compareImages, { body });
  }

  /**
   * List all users
   */
  async listUsers(): Promise<ListUsersResponse> {
    return callContract(this.baseUrl, Contracts.listUsers);
  }

  /**
   * Get profile image URL for a user
   */
  getProfileImageUrl(profileImagePath: string): string {
    return `${this.baseUrl}/images/file/${encodeURIComponent(profileImagePath)}`;
  }
}

/**
 * Create an API client instance with the given base URL
 */
export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient(baseUrl);
}
