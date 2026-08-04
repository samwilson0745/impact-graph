'use client';

import { useQuery } from '@tanstack/react-query';
import { listServices } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: listServices,
    staleTime: 5 * 60_000,
  });
}
