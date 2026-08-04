'use client';

import { useQuery } from '@tanstack/react-query';
import { getShortestPath } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useShortestPath(from: string | null, to: string | null) {
  return useQuery({
    queryKey: queryKeys.shortestPath(from ?? '', to ?? ''),
    queryFn: () => getShortestPath(from as string, to as string),
    enabled: from !== null && to !== null && from !== to,
    retry: false,
  });
}
