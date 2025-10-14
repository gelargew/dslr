/**
 * Base API service with error handling and common functionality
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

export class BaseService {
  /**
   * Generic fetch method with error handling and logging
   */
  protected async fetchWithErrorHandling<T = any>(
    url: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 API Request: ${options?.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      console.log(`✅ API Success: ${url}`);
      return data;
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
      };

      console.error(`❌ API Error for ${url}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Fetch with multipart/form-data for file uploads
   */
  protected async fetchWithFormData<T = any>(
    url: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`📤 API Upload: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        ...options,
      });

      console.log(`📡 Upload Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log(`✅ Upload Success: ${url}`);
      return data;
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown upload error',
        status: 0,
      };

      console.error(`❌ Upload Error for ${url}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  protected handleApiError(error: unknown): string {
    if (error instanceof Error) {
      // Common error patterns
      if (error.message.includes('Failed to fetch')) {
        return 'Network error. Please check your connection.';
      }
      if (error.message.includes('401')) {
        return 'Authentication required. Please log in again.';
      }
      if (error.message.includes('403')) {
        return 'You do not have permission to perform this action.';
      }
      if (error.message.includes('404')) {
        return 'The requested resource was not found.';
      }
      if (error.message.includes('500')) {
        return 'Server error. Please try again later.';
      }

      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Create a fallback response when API fails
   */
  protected createFallbackResponse<T>(fallbackData: T): ApiResponse<T> {
    return {
      success: true,
      data: fallbackData,
    };
  }
}