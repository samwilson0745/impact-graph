import type {
  ApiErrorBody,
  BlastRadiusResult,
  HealthStatus,
  RiskiestServiceEntry,
  ServiceNode,
  SharedDatabaseRiskEntry,
  ShortestPathResult,
  SinglePointOfFailureEntry,
  TeamNode,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? body.error);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.error;
  }

  get isDatabaseUnreachable(): boolean {
    return this.code === 'database_unreachable';
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

async function apiFetch<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE_URL}/api${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch {
    throw new ApiError(503, { error: 'database_unreachable', message: 'Could not reach the ImpactGraph API.' });
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: 'unknown_error' }))) as ApiErrorBody;
    throw new ApiError(response.status, body);
  }

  return response.json() as Promise<T>;
}

export function getHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>('/health');
}

export async function listServices(): Promise<ServiceNode[]> {
  const { services } = await apiFetch<{ services: ServiceNode[] }>('/services');
  return services;
}

export async function getBlastRadius(serviceId: string, maxHops: number): Promise<BlastRadiusResult> {
  return apiFetch<BlastRadiusResult>(`/services/${encodeURIComponent(serviceId)}/blast-radius`, { maxHops });
}

export async function getTeamsToNotify(serviceId: string, maxHops: number): Promise<TeamNode[]> {
  const { teams } = await apiFetch<{ teams: TeamNode[] }>(
    `/services/${encodeURIComponent(serviceId)}/teams-to-notify`,
    { maxHops },
  );
  return teams;
}

export async function getSinglePointsOfFailure(
  serviceId: string,
  maxHops: number,
): Promise<SinglePointOfFailureEntry[]> {
  const { singlePointsOfFailure } = await apiFetch<{ singlePointsOfFailure: SinglePointOfFailureEntry[] }>(
    `/services/${encodeURIComponent(serviceId)}/single-points-of-failure`,
    { maxHops },
  );
  return singlePointsOfFailure;
}

export async function getSharedDatabaseRisk(serviceId: string): Promise<SharedDatabaseRiskEntry[]> {
  const { atRisk } = await apiFetch<{ atRisk: SharedDatabaseRiskEntry[] }>(
    `/services/${encodeURIComponent(serviceId)}/shared-database-risk`,
  );
  return atRisk;
}

export async function getShortestPath(from: string, to: string): Promise<ShortestPathResult> {
  return apiFetch<ShortestPathResult>('/shortest-path', { from, to });
}

export async function getRiskiestServices(limit = 10): Promise<RiskiestServiceEntry[]> {
  const { riskiest } = await apiFetch<{ riskiest: RiskiestServiceEntry[] }>('/leaderboard/riskiest-services', {
    limit,
  });
  return riskiest;
}
