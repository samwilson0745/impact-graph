import type { DatabaseType, ServiceTier } from '@/types/api';

export const TIER_COLORS: Record<ServiceTier, string> = {
  critical: '#e11d48',
  core: '#d97706',
  supporting: '#0284c7',
};

export const TIER_LABELS: Record<ServiceTier, string> = {
  critical: 'Critical',
  core: 'Core',
  supporting: 'Supporting',
};

export const NODE_TYPE_COLORS = {
  service: '#64748b',
  api: '#2563eb',
  kafkaTopic: '#7c3aed',
  database: '#0d9488',
  team: '#78716c',
} as const;

export const NODE_TYPE_LABELS = {
  service: 'Service',
  api: 'API',
  kafkaTopic: 'Kafka topic',
  database: 'Database',
  team: 'Team',
} as const;

export const DATABASE_TYPE_LABELS: Record<DatabaseType, string> = {
  postgres: 'Postgres',
  redis: 'Redis',
  s3: 'S3',
  elasticsearch: 'Elasticsearch',
};

export const ROOT_NODE_COLOR = '#1e1b4b';

/** A sequential scale for hop distance — used for edge/label emphasis, not node fill (fill = tier). */
export function hopOpacity(hop: number, maxHops: number): number {
  if (maxHops <= 0) return 1;
  const t = Math.min(hop, maxHops) / maxHops;
  return 1 - t * 0.55;
}
