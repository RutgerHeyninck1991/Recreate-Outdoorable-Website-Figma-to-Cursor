import React from 'react';
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ecff565c`;

export interface Fabric {
  id: string;
  name: string;
  category: string;
  color: string;
  texturePattern?: string | null;
  textureUrl?: string | null;
  // PBR Texture Maps
  normalMapUrl?: string | null;
  roughnessMapUrl?: string | null;
  aoMapUrl?: string | null;
  displacementMapUrl?: string | null;
  description: string;
  pricePerMeter: number;
  composition: string;
  waterResistant: boolean;
  uvResistant: boolean;
  active: boolean;
  order: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FabricCategory {
  name: string;
  count: number;
  displayName: string;
}

// Simple cache for fabric data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new SimpleCache();

class FabricAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }

  async getFabrics(filters?: { category?: string; active?: boolean }): Promise<Fabric[]> {
    try {
      // Create cache key based on filters
      const cacheKey = `fabrics:${JSON.stringify(filters || {})}`;
      
      // Check cache first
      const cached = cache.get<Fabric[]>(cacheKey);
      if (cached) {
        console.log('Returning cached fabrics');
        return cached;
      }

      const params = new URLSearchParams();
      
      if (filters?.category) {
        params.append('category', filters.category);
      }
      
      if (filters?.active !== undefined) {
        params.append('active', filters.active.toString());
      }
      
      const endpoint = `/fabrics${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      const data = await response.json();
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching fabrics:', error);
      throw error;
    }
  }

  async getFabric(id: string): Promise<Fabric> {
    try {
      const cacheKey = `fabric:${id}`;
      
      // Check cache first
      const cached = cache.get<Fabric>(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.makeRequest(`/fabrics/${id}`);
      const data = await response.json();
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching fabric:', error);
      throw error;
    }
  }

  async getCategories(): Promise<FabricCategory[]> {
    try {
      const cacheKey = 'fabric-categories';
      
      // Check cache first
      const cached = cache.get<FabricCategory[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.makeRequest('/fabric-categories');
      const data = await response.json();
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching fabric categories:', error);
      throw error;
    }
  }

  async initializeFabrics(): Promise<{ message: string; count: number }> {
    try {
      const response = await this.makeRequest('/fabrics/initialize', {
        method: 'POST',
      });
      const result = await response.json();
      
      // Clear cache after initialization
      cache.clear();
      
      return result;
    } catch (error) {
      console.error('Error initializing fabrics:', error);
      throw error;
    }
  }

  async createFabric(fabricData: Partial<Fabric> & { id: string; name: string; category: string }): Promise<Fabric> {
    try {
      const response = await this.makeRequest('/fabrics', {
        method: 'POST',
        body: JSON.stringify(fabricData),
      });
      const result = await response.json();
      
      // Invalidate fabric cache
      cache.invalidate('fabrics:');
      cache.invalidate('fabric-categories');
      
      return result.fabric;
    } catch (error) {
      console.error('Error creating fabric:', error);
      throw error;
    }
  }

  async updateFabric(id: string, updates: Partial<Fabric>): Promise<Fabric> {
    try {
      const response = await this.makeRequest(`/fabrics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const result = await response.json();
      
      // Invalidate specific cache entries
      cache.invalidate('fabrics:');
      cache.invalidate('fabric-categories');
      cache.invalidate(`fabric:${id}`);
      
      return result.fabric;
    } catch (error) {
      console.error('Error updating fabric:', error);
      throw error;
    }
  }

  async deleteFabric(id: string): Promise<void> {
    try {
      await this.makeRequest(`/fabrics/${id}`, {
        method: 'DELETE',
      });
      
      // Invalidate cache
      cache.invalidate('fabrics:');
      cache.invalidate('fabric-categories');
      cache.invalidate(`fabric:${id}`);
    } catch (error) {
      console.error('Error deleting fabric:', error);
      throw error;
    }
  }

  async syncFromStorage(bucketName?: string): Promise<{ message: string; count: number; bucket?: string; created?: number; updated?: number; skipped?: number; totalFilesInBucket?: number; processedFiles?: string[]; availableBuckets?: any[] }> {
    try {
      const response = await this.makeRequest('/fabrics/sync-storage', {
        method: 'POST',
        body: bucketName ? JSON.stringify({ bucket: bucketName }) : undefined,
      });
      const result = await response.json();
      
      // Clear cache after sync
      cache.clear();
      
      return result;
    } catch (error) {
      console.error('Error syncing fabrics from storage:', error);
      throw error;
    }
  }

  async getStorageBuckets(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/storage/buckets');
      const result = await response.json();
      return result.buckets || [];
    } catch (error) {
      console.error('Error fetching storage buckets:', error);
      throw error;
    }
  }

  async getStorageFiles(bucket: string): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/storage/files/${encodeURIComponent(bucket)}`);
      const result = await response.json();
      return result.files || [];
    } catch (error) {
      console.error('Error fetching storage files:', error);
      throw error;
    }
  }

  async cleanupDefaultFabrics(): Promise<{ message: string; deleted: number; remaining: number; deletedIds: string[] }> {
    try {
      const response = await this.makeRequest('/fabrics/cleanup-defaults', {
        method: 'POST',
      });
      const result = await response.json();
      
      // Clear cache after cleanup
      cache.clear();
      
      return result;
    } catch (error) {
      console.error('Error cleaning up default fabrics:', error);
      throw error;
    }
  }

  // Clear all fabric-related cache
  clearCache(): void {
    cache.clear();
  }
}

export const fabricApi = new FabricAPI();

// React hooks for fabric management with optimized caching
export function useFabrics(filters?: { category?: string; active?: boolean }) {
  const [fabrics, setFabrics] = React.useState<Fabric[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchFabrics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fabricApi.getFabrics(filters);
      setFabrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fabrics');
      setFabrics([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.active]);

  React.useEffect(() => {
    let isCancelled = false;

    const loadFabrics = async () => {
      if (isCancelled) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await fabricApi.getFabrics(filters);
        
        if (!isCancelled) {
          setFabrics(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch fabrics');
          setFabrics([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadFabrics();

    return () => {
      isCancelled = true;
    };
  }, [filters?.category, filters?.active]);

  return {
    fabrics,
    loading,
    error,
    refetch: fetchFabrics
  };
}

export function useFabricCategories() {
  const [categories, setCategories] = React.useState<FabricCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isCancelled = false;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fabricApi.getCategories();
        
        if (!isCancelled) {
          setCategories(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { categories, loading, error };
}