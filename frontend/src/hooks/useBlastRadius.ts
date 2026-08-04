'use client';

import { useQuery } from '@tanstack/react-query';
import { getBlastRadius, getSharedDatabaseRisk, getSinglePointsOfFailure } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useBlastRadius(serviceId: string | null, maxHops: number) {
  return useQuery({
    queryKey: queryKeys.blastRadius(serviceId ?? '', maxHops),
    queryFn: () => getBlastRadius(serviceId as string, maxHops),
    enabled: serviceId !== null,
  });
}

export function useSinglePointsOfFailure(serviceId: string | null, maxHops: number) {
  return useQuery({
    queryKey: queryKeys.singlePointsOfFailure(serviceId ?? '', maxHops),
    queryFn: () => getSinglePointsOfFailure(serviceId as string, maxHops),
    enabled: serviceId !== null,
  });
}

export function useSharedDatabaseRisk(serviceId: string | null) {
  return useQuery({
    queryKey: queryKeys.sharedDatabaseRisk(serviceId ?? ''),
    queryFn: () => getSharedDatabaseRisk(serviceId as string),
    enabled: serviceId !== null,
  });
}
