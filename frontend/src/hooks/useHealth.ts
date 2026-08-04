'use client';

import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: getHealth,
    refetchInterval: 15_000,
    retry: false,
  });
}
