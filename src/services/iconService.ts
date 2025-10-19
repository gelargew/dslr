import { BaseService, ApiResponse } from './baseService';
import { OverlayIcon } from '@/assets/icons/overlay-icons';
import { API_BASE_URL } from '@/constants/api-constants';

// Backend icon data structure
interface BackendIcon {
  id: number;
  name: string;
  url: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface IconListResponse {
  data: BackendIcon[];
}

export class IconService extends BaseService {
  private cache: OverlayIcon[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load icons from backend API with caching
   */
  async loadIcons(): Promise<OverlayIcon[]> {
    // Check cache validity
    if (this.cache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      console.log('📋 Using cached icons');
      return this.cache;
    }

    console.log('🔄 Loading icons from API...');

    try {
      const response = await this.fetchWithErrorHandling<IconListResponse>(
        `${API_BASE_URL}/api/icons`
      );

      const backendIcons = response.data || [];
      console.log(`📥 Loaded ${backendIcons.length} icons from API`);

      // Convert backend icons to our OverlayIcon format with standardized config
      const convertedIcons = backendIcons.map(this.convertBackendIcon);

      // Cache the results
      this.cache = convertedIcons;
      this.lastFetch = Date.now();

      console.log(`✅ Icons loaded successfully: ${convertedIcons.length} total icons`);
      return convertedIcons;
    } catch (error) {
      console.warn('⚠️ Failed to load icons from API, using fallback');
      const fallbackIcons = this.getLocalFallbackIcons();

      // Cache fallback results
      this.cache = fallbackIcons;
      this.lastFetch = Date.now();

      return fallbackIcons;
    }
  }

  /**
   * Convert backend icon data to our OverlayIcon format
   */
  private convertBackendIcon(backendIcon: BackendIcon): OverlayIcon {
    return {
      id: `icon-${backendIcon.id}`,
      backendId: backendIcon.id,
      name: backendIcon.name,
      category: backendIcon.category || 'General',
      iconPath: backendIcon.url,
      iconType: 'png', // Assume PNG for backend images
      defaultSize: 80, // Standard default size
      defaultPosition: { x: 540, y: 540 }, // Centered position for 1080×1080 canvas
    };
  }

  /**
   * Fallback icons if API fails
   */
  private getLocalFallbackIcons(): OverlayIcon[] {
    console.log('📦 Using local fallback icons');

    // Return a minimal set of fallback icons
    return [
      {
        id: 'fallback-heart',
        name: 'Heart',
        category: 'Stiker',
        iconPath: '/assets/icons/heart.png',
        iconType: 'png',
        defaultSize: 64,
        defaultPosition: { x: 300, y: 400 },
      },
      {
        id: 'fallback-star',
        name: 'Star',
        category: 'Stiker',
        iconPath: '/assets/icons/star.png',
        iconType: 'png',
        defaultSize: 100,
        defaultPosition: { x: 900, y: 500 },
      },
      {
        id: 'fallback-logo',
        name: 'Event Logo',
        category: 'Event',
        iconPath: '/assets/icons/plabs.png',
        iconType: 'png',
        defaultSize: 80,
        defaultPosition: { x: 600, y: 300 },
      },
    ];
  }

  /**
   * Get icons grouped by category
   */
  async getIconsByCategory(category: string): Promise<OverlayIcon[]> {
    const allIcons = await this.loadIcons();
    return allIcons.filter(icon => icon.category === category);
  }

  /**
   * Get unique categories
   */
  async getIconCategories(): Promise<string[]> {
    const allIcons = await this.loadIcons();
    return [...new Set(allIcons.map(icon => icon.category))];
  }

  /**
   * Get icon by ID (local fallback or backend ID)
   */
  async getIconById(id: string): Promise<OverlayIcon | undefined> {
    const allIcons = await this.loadIcons();
    return allIcons.find(icon => icon.id === id);
  }

  /**
   * Get icon by backend ID
   */
  async getIconByBackendId(backendId: number): Promise<OverlayIcon | undefined> {
    const allIcons = await this.loadIcons();
    return allIcons.find(icon => icon.backendId === backendId);
  }

  /**
   * Clear the cache (useful for testing or force refresh)
   */
  clearCache(): void {
    console.log('🗑️ Clearing icon cache');
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

  /**
   * Force refresh (clear cache and reload)
   */
  async refreshIcons(): Promise<OverlayIcon[]> {
    this.clearCache();
    return this.loadIcons();
  }
}

// Export singleton instance
export const iconService = new IconService();