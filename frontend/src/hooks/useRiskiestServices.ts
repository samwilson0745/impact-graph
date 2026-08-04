'use client';

import { useQuery } from '@tanstack/react-query';
import { getRiskiestServices } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useRiskiestServices(limit = 8) {
  return useQuery({
    queryKey: queryKeys.riskiestServices(limit),
    queryFn: () => getRiskiestServices(limit),
    staleTime: 5 * 60_000,
  });
}
