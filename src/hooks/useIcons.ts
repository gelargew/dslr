import { useState, useEffect, useCallback } from 'react';
import { OverlayIcon } from '@/assets/icons/overlay-icons';
import { iconService } from '@/services/iconService';

interface UseIconsState {
  icons: OverlayIcon[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for loading icons from backend API with caching
 */
export const useIcons = (): UseIconsState => {
  const [icons, setIcons] = useState<OverlayIcon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIcons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedIcons = await iconService.loadIcons();
      setIcons(loadedIcons);
      console.log(`✅ Loaded ${loadedIcons.length} icons`);
    } catch (error) {
      const errorMessage = iconService.handleApiError(error);
      setError(errorMessage);
      console.error('❌ Failed to load icons:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadIcons();
  }, [loadIcons]);

  return {
    icons,
    loading,
    error,
    refetch: loadIcons,
  };
};

/**
 * Hook for getting icons by category
 */
export const useIconsByCategory = (category?: string) => {
  const { icons, loading, error, refetch } = useIcons();

  const filteredIcons = category
    ? icons.filter(icon => icon.category === category)
    : icons;

  return {
    icons: filteredIcons,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for getting icon by ID
 */
export const useIconById = (id?: string) => {
  const { icons, loading, error } = useIcons();

  const icon = id ? icons.find(icon => icon.id === id) : undefined;

  return {
    icon,
    loading,
    error,
  };
};

/**
 * Hook for getting icon by backend ID
 */
export const useIconByBackendId = (backendId?: number) => {
  const [icon, setIcon] = useState<OverlayIcon | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIconByBackendId = useCallback(async () => {
    if (!backendId) {
      setIcon(undefined);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const foundIcon = await iconService.getIconByBackendId(backendId);
      setIcon(foundIcon);
      console.log(`✅ Found icon for backend ID ${backendId}:`, foundIcon?.name);
    } catch (error) {
      const errorMessage = iconService.handleApiError(error);
      setError(errorMessage);
      console.error(`❌ Failed to get icon by backend ID ${backendId}:`, error);
    } finally {
      setLoading(false);
    }
  }, [backendId]);

  // Load when backendId changes
  useEffect(() => {
    loadIconByBackendId();
  }, [loadIconByBackendId]);

  return {
    icon,
    loading,
    error,
    refetch: loadIconByBackendId,
  };
};

/**
 * Hook for getting available icon categories
 */
export const useIconCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedCategories = await iconService.getIconCategories();
      setCategories(loadedCategories);
      console.log(`✅ Loaded ${loadedCategories.length} icon categories:`, loadedCategories);
    } catch (error) {
      const errorMessage = iconService.handleApiError(error);
      setError(errorMessage);
      console.error('❌ Failed to load icon categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refetch: loadCategories,
  };
};

/**
 * Hook for getting icon with category pre-filtered
 */
export const useIconsByCategoryFiltered = () => {
  const { icons, loading, error, refetch } = useIcons();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = useIconCategories();

  const filteredIcons = selectedCategory
    ? icons.filter(icon => icon.category === selectedCategory)
    : icons;

  const changeCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return {
    icons: filteredIcons,
    selectedCategory,
    categories: categories.categories,
    categoriesLoading: categories.loading,
    loading: loading || categories.loading,
    error: error || categories.error,
    changeCategory,
    refetch,
  };
};

/**
 * Hook for clearing icon cache (useful for testing)
 */
export const useIconCache = () => {
  const clearCache = useCallback(() => {
    iconService.clearCache();
    console.log('🗑️ Icon cache cleared');
  }, []);

  const getCacheStatus = useCallback(() => {
    return iconService.getCacheStatus();
  }, []);

  return {
    clearCache,
    getCacheStatus,
  };
};

/**
 * Hook for refreshing icons (clear cache and reload)
 */
export const useIconRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      await iconService.refreshIcons();
      console.log('✅ Icons refreshed successfully');
    } catch (error) {
      const errorMessage = iconService.handleApiError(error);
      setError(errorMessage);
      console.error('❌ Failed to refresh icons:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    refreshing,
    error,
    refresh,
  };
};