import { BaseService, ApiResponse } from './baseService';
import { FrameTemplate } from '@/assets/frames/frame-templates';
import { API_BASE_URL } from '@/constants/api-constants';

// Backend frame data structure
interface BackendFrame {
  id: number;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface FrameListResponse {
  data: BackendFrame[];
}

export class FrameService extends BaseService {
  private cache: FrameTemplate[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load frames from backend API with caching
   */
  async loadFrames(): Promise<FrameTemplate[]> {
    // Check cache validity
    if (this.cache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      console.log('📋 Using cached frames');
      return this.cache;
    }

    console.log('🔄 Loading frames from API...');

    try {
      const response = await this.fetchWithErrorHandling<FrameListResponse>(
        `${API_BASE_URL}/api/admin/frames`
      );

      const backendFrames = response.data || [];
      console.log(`📥 Loaded ${backendFrames.length} frames from API`);

      // Convert backend frames to our FrameTemplate format with standardized config
      const convertedFrames = backendFrames.map(this.convertBackendFrame);

      // Add special "No Frame" option at the beginning
      const allFrames = [
        this.createNoFrameOption(),
        ...convertedFrames
      ];

      // Cache the results
      this.cache = allFrames;
      this.lastFetch = Date.now();

      console.log(`✅ Frames loaded successfully: ${allFrames.length} total frames`);
      return allFrames;
    } catch (error) {
      console.warn('⚠️ Failed to load frames from API, using fallback');
      const fallbackFrames = this.getLocalFallbackFrames();

      // Cache fallback results
      this.cache = fallbackFrames;
      this.lastFetch = Date.now();

      return fallbackFrames;
    }
  }

  /**
   * Convert backend frame data to our FrameTemplate format
   */
  private convertBackendFrame(backendFrame: BackendFrame): FrameTemplate {
    return {
      id: `frame-${backendFrame.id}`,
      name: backendFrame.name,
      category: 'backend', // All backend frames in one category
      previewImage: backendFrame.url, // Use same URL for preview
      frameImage: backendFrame.url,
      cssClass: `frame-backend-${backendFrame.id}`,
      style: {
        borderWidth: 0,
        borderColor: 'transparent',
        useFrameImage: true,
        textSettings: {
          enabled: true,
          position: { x: 100, y: 1350 }, // Standardized position from FRAME_STANDARDIZATION.md
          maxWidth: 1000, // Full inner photo width
          fontSize: 48, // Standard font size
          fontFamily: 'Geist',
          color: '#ffffff', // Default white color
          padding: 20,
          align: 'center',
          editable: {
            position: true,
            color: true,
            size: true,
          },
        },
      },
    };
  }

  /**
   * Create the special "No Frame" option
   */
  private createNoFrameOption(): FrameTemplate {
    return {
      id: 'none',
      name: 'No Frame',
      category: 'basic',
      previewImage: '/assets/frames/previews/no-frame.png',
      frameImage: null,
      cssClass: 'frame-none',
      style: {
        borderWidth: 0,
        borderColor: 'transparent',
        useFrameImage: false,
        textSettings: {
          enabled: false,
          position: { x: 600, y: 1600 }, // Centered position (won't be used)
          maxWidth: 1000,
          fontSize: 0,
          fontFamily: 'Geist',
          color: 'transparent',
          padding: 0,
          align: 'center',
          editable: {
            position: false,
            color: false,
            size: false,
          },
        },
      },
    };
  }

  /**
   * Fallback frames if API fails
   */
  private getLocalFallbackFrames(): FrameTemplate[] {
    console.log('📦 Using local fallback frames');

    // Return a minimal set of fallback frames
    return [
      this.createNoFrameOption(),
      {
        id: 'fallback-frame-1',
        name: 'Fallback Frame',
        category: 'fallback',
        previewImage: '/assets/frames/previews/spotify-preview.png',
        frameImage: '/assets/frames/frame-spotify.png',
        cssClass: 'frame-fallback',
        style: {
          borderWidth: 0,
          borderColor: 'transparent',
          useFrameImage: true,
          textSettings: {
            enabled: true,
            position: { x: 100, y: 1350 },
            maxWidth: 1000,
            fontSize: 48,
            fontFamily: 'Geist',
            color: '#ffffff',
            padding: 20,
            align: 'center',
            editable: {
              position: true,
              color: true,
              size: true,
            },
          },
        },
      },
    ];
  }

  /**
   * Clear the cache (useful for testing or force refresh)
   */
  clearCache(): void {
    console.log('🗑️ Clearing frame cache');
    this.cache = null;
    this.lastFetch = 0;
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { hasCachedData: boolean; lastFetch: number; cacheAge: number } {
    return {
      hasCachedData: this.cache !== null,
      lastFetch: this.lastFetch,
      cacheAge: Date.now() - this.lastFetch,
    };
  }
}

// Export singleton instance
export const frameService = new FrameService();