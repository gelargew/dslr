import { useState, useEffect, useCallback } from 'react';
import { FrameTemplate } from '@/assets/frames/frame-templates';
import { frameService } from '@/services/frameService';

interface UseFramesState {
  frames: FrameTemplate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for loading frames from backend API with caching
 */
export const useFrames = (): UseFramesState => {
  const [frames, setFrames] = useState<FrameTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFrames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedFrames = await frameService.loadFrames();
      setFrames(loadedFrames);
      console.log(`✅ Loaded ${loadedFrames.length} frames`);
    } catch (error) {
      const errorMessage = frameService.handleApiError(error);
      setError(errorMessage);
      console.error('❌ Failed to load frames:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFrames();
  }, [loadFrames]);

  return {
    frames,
    loading,
    error,
    refetch: loadFrames,
  };
};

/**
 * Hook for getting frames by category
 */
export const useFramesByCategory = (category?: string) => {
  const { frames, loading, error, refetch } = useFrames();

  const filteredFrames = category
    ? frames.filter(frame => frame.category === category)
    : frames;

  return {
    frames: filteredFrames,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for getting frame by ID
 */
export const useFrameById = (id?: string) => {
  const { frames, loading, error } = useFrames();

  const frame = id ? frames.find(frame => frame.id === id) : undefined;

  return {
    frame,
    loading,
    error,
  };
};

/**
 * Hook for getting available frame categories
 */
export const useFrameCategories = () => {
  const { frames, loading, error } = useFrames();

  const categories = [...new Set(frames.map(frame => frame.category))];

  return {
    categories,
    loading,
    error,
  };
};

/**
 * Hook for clearing frame cache (useful for testing)
 */
export const useFrameCache = () => {
  const clearCache = useCallback(() => {
    frameService.clearCache();
    console.log('🗑️ Frame cache cleared');
  }, []);

  const getCacheStatus = useCallback(() => {
    return frameService.getCacheStatus();
  }, []);

  return {
    clearCache,
    getCacheStatus,
  };
};