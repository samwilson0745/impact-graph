export const queryKeys = {
  health: ['health'] as const,
  services: ['services'] as const,
  blastRadius: (serviceId: string, maxHops: number) => ['blast-radius', serviceId, maxHops] as const,
  singlePointsOfFailure: (serviceId: string, maxHops: number) =>
    ['single-points-of-failure', serviceId, maxHops] as const,
  sharedDatabaseRisk: (serviceId: string) => ['shared-database-risk', serviceId] as const,
  shortestPath: (from: string, to: string) => ['shortest-path', from, to] as const,
  riskiestServices: (limit: number) => ['riskiest-services', limit] as const,
};
