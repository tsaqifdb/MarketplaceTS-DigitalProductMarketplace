'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCuratorPoints(curatorId?: string) {
  const [curatorPoints, setCuratorPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCuratorPoints = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParam = curatorId ? `?curatorId=${curatorId}` : '';
      const response = await fetch(`/api/curator/points${queryParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch curator points');
      }
      
      const data = await response.json();
      setCuratorPoints(data.curatorPoints);
    } catch (err) {
      console.error('Error fetching curator points:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [curatorId]);

  useEffect(() => {
    fetchCuratorPoints();
  }, [fetchCuratorPoints]);

  return {
    curatorPoints,
    isLoading,
    error,
    refresh: fetchCuratorPoints
  };
}