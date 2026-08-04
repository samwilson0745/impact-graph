export type ServiceTier = 'critical' | 'core' | 'supporting';
export type ServiceLanguage = 'go' | 'node' | 'python' | 'java' | 'ruby';
export type DatabaseType = 'postgres' | 'redis' | 's3' | 'elasticsearch';

export interface ServiceNode {
  id: string;
  name: string;
  tier: ServiceTier;
  language: ServiceLanguage;
  owner_team_id: string;
}

export interface ApiNode {
  id: string;
  name: string;
  path: string;
}

export interface DatabaseNode {
  id: string;
  name: string;
  type: DatabaseType;
}

export interface KafkaTopicNode {
  id: string;
  name: string;
}

export interface TeamNode {
  id: string;
  name: string;
  slack_channel: string;
}

export interface DeploymentNode {
  id: string;
  version: string;
  timestamp: string;
}

export interface BlastRadiusServiceEntry extends ServiceNode {
  hop: number;
}

export interface ServiceImpactFootprint {
  serviceId: string;
  apis: ApiNode[];
  publishedTopics: KafkaTopicNode[];
  consumedTopics: KafkaTopicNode[];
  readsFromDatabases: DatabaseNode[];
  writesToDatabases: DatabaseNode[];
  team: TeamNode | null;
}

export interface ApiImpact extends ApiNode {
  serviceId: string;
}

export interface TopicImpact extends KafkaTopicNode {
  publishers: string[];
  consumers: string[];
}

export interface DatabaseImpact extends DatabaseNode {
  readers: string[];
  writers: string[];
}

export interface BlastRadiusResult {
  service: ServiceNode;
  maxHops: number;
  affectedServices: BlastRadiusServiceEntry[];
  serviceEdges: { from: string; to: string }[];
  apis: ApiImpact[];
  kafkaTopics: TopicImpact[];
  databases: DatabaseImpact[];
  teams: TeamNode[];
}

export interface SinglePointOfFailureEntry {
  dependency: ServiceNode;
  hop: number;
}

export interface ShortestPathResult {
  from: ServiceNode;
  to: ServiceNode;
  hops: number;
  path: ServiceNode[];
  edges: { from: string; to: string }[];
}

export interface SharedDatabaseRiskEntry extends ServiceNode {
  sharedDatabases: DatabaseNode[];
}

export interface RiskiestServiceEntry extends ServiceNode {
  dependentCount: number;
}
