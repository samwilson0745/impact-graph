// Fictional mid-sized microservice architecture used to seed CognoDB for ImpactGraph.
// Every node id is a stable kebab-case slug so re-running the loader is idempotent (MERGE on id).

export interface ServiceRow {
  id: string;
  name: string;
  tier: 'critical' | 'core' | 'supporting';
  language: 'go' | 'node' | 'python' | 'java' | 'ruby';
  owner_team_id: string;
}

export interface ApiRow {
  id: string;
  name: string;
  path: string;
}

export interface DatabaseRow {
  id: string;
  name: string;
  type: 'postgres' | 'redis' | 's3' | 'elasticsearch';
}

export interface KafkaTopicRow {
  id: string;
  name: string;
}

export interface TeamRow {
  id: string;
  name: string;
  slack_channel: string;
}

export interface DeploymentRow {
  id: string;
  version: string;
  timestamp: string; // ISO 8601
}

export interface Edge {
  from: string;
  to: string;
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export const teams: TeamRow[] = [
  { id: 'payments-team', name: 'Payments', slack_channel: '#payments-eng' },
  { id: 'identity-team', name: 'Identity', slack_channel: '#identity-eng' },
  { id: 'catalog-team', name: 'Catalog', slack_channel: '#catalog-eng' },
  { id: 'growth-team', name: 'Growth', slack_channel: '#growth-eng' },
  { id: 'trust-safety-team', name: 'Trust & Safety', slack_channel: '#trust-safety-eng' },
  { id: 'fulfillment-team', name: 'Fulfillment', slack_channel: '#fulfillment-eng' },
  { id: 'platform-team', name: 'Platform', slack_channel: '#platform-eng' },
  { id: 'data-team', name: 'Data', slack_channel: '#data-eng' },
];

// ---------------------------------------------------------------------------
// Services (32) — tier reflects blast-radius severity, not org size.
// ---------------------------------------------------------------------------

export const services: ServiceRow[] = [
  { id: 'api-gateway', name: 'API Gateway', tier: 'critical', language: 'go', owner_team_id: 'platform-team' },

  { id: 'auth-service', name: 'Auth Service', tier: 'critical', language: 'go', owner_team_id: 'identity-team' },
  { id: 'identity-provider-service', name: 'Identity Provider Service', tier: 'core', language: 'java', owner_team_id: 'identity-team' },
  { id: 'user-service', name: 'User Service', tier: 'core', language: 'node', owner_team_id: 'identity-team' },
  { id: 'profile-service', name: 'Profile Service', tier: 'supporting', language: 'node', owner_team_id: 'identity-team' },
  { id: 'session-service', name: 'Session Service', tier: 'core', language: 'go', owner_team_id: 'identity-team' },

  { id: 'catalog-service', name: 'Catalog Service', tier: 'core', language: 'python', owner_team_id: 'catalog-team' },
  { id: 'inventory-service', name: 'Inventory Service', tier: 'core', language: 'java', owner_team_id: 'catalog-team' },
  { id: 'pricing-service', name: 'Pricing Service', tier: 'core', language: 'python', owner_team_id: 'catalog-team' },
  { id: 'promo-service', name: 'Promo Service', tier: 'supporting', language: 'node', owner_team_id: 'catalog-team' },

  { id: 'search-service', name: 'Search Service', tier: 'core', language: 'python', owner_team_id: 'growth-team' },
  { id: 'recommendation-service', name: 'Recommendation Service', tier: 'supporting', language: 'python', owner_team_id: 'growth-team' },

  { id: 'cart-service', name: 'Cart Service', tier: 'critical', language: 'node', owner_team_id: 'payments-team' },
  { id: 'order-service', name: 'Order Service', tier: 'critical', language: 'java', owner_team_id: 'payments-team' },
  { id: 'payment-service', name: 'Payment Service', tier: 'critical', language: 'java', owner_team_id: 'payments-team' },
  { id: 'wallet-service', name: 'Wallet Service', tier: 'core', language: 'java', owner_team_id: 'payments-team' },
  { id: 'ledger-service', name: 'Ledger Service', tier: 'core', language: 'java', owner_team_id: 'payments-team' },
  { id: 'tax-service', name: 'Tax Service', tier: 'supporting', language: 'python', owner_team_id: 'payments-team' },

  { id: 'fraud-service', name: 'Fraud Service', tier: 'critical', language: 'python', owner_team_id: 'trust-safety-team' },
  { id: 'risk-scoring-service', name: 'Risk Scoring Service', tier: 'core', language: 'python', owner_team_id: 'trust-safety-team' },
  { id: 'support-service', name: 'Support Service', tier: 'supporting', language: 'ruby', owner_team_id: 'trust-safety-team' },

  { id: 'shipping-service', name: 'Shipping Service', tier: 'core', language: 'go', owner_team_id: 'fulfillment-team' },
  { id: 'warehouse-service', name: 'Warehouse Service', tier: 'core', language: 'java', owner_team_id: 'fulfillment-team' },
  { id: 'carrier-service', name: 'Carrier Service', tier: 'supporting', language: 'node', owner_team_id: 'fulfillment-team' },
  { id: 'geo-service', name: 'Geo Service', tier: 'supporting', language: 'go', owner_team_id: 'fulfillment-team' },

  { id: 'notification-service', name: 'Notification Service', tier: 'core', language: 'node', owner_team_id: 'platform-team' },
  { id: 'email-service', name: 'Email Service', tier: 'supporting', language: 'node', owner_team_id: 'platform-team' },
  { id: 'sms-service', name: 'SMS Service', tier: 'supporting', language: 'node', owner_team_id: 'platform-team' },
  { id: 'push-service', name: 'Push Service', tier: 'supporting', language: 'node', owner_team_id: 'platform-team' },

  { id: 'analytics-service', name: 'Analytics Service', tier: 'core', language: 'python', owner_team_id: 'data-team' },
  { id: 'reporting-service', name: 'Reporting Service', tier: 'supporting', language: 'python', owner_team_id: 'data-team' },
  { id: 'audit-service', name: 'Audit Service', tier: 'supporting', language: 'go', owner_team_id: 'data-team' },
];

// ---------------------------------------------------------------------------
// APIs — one per service, exposed under a predictable path.
// ---------------------------------------------------------------------------

export const apis: ApiRow[] = services.map((s) => {
  const slug = s.id.replace(/-service$/, '').replace('api-gateway', 'gateway');
  return { id: `api-${s.id}`, name: `${s.name} API`, path: `/api/${slug}` };
});

export const exposes: Edge[] = services.map((s) => ({ from: s.id, to: `api-${s.id}` }));

// ---------------------------------------------------------------------------
// Databases (13) — shared databases are the interesting cases.
// ---------------------------------------------------------------------------

export const databases: DatabaseRow[] = [
  { id: 'auth-db', name: 'auth-db', type: 'postgres' },
  { id: 'users-db', name: 'users-db', type: 'postgres' },
  { id: 'catalog-db', name: 'catalog-db', type: 'postgres' },
  { id: 'inventory-db', name: 'inventory-db', type: 'postgres' },
  { id: 'pricing-db', name: 'pricing-db', type: 'postgres' },
  { id: 'cart-cache', name: 'cart-cache', type: 'redis' },
  { id: 'orders-db', name: 'orders-db', type: 'postgres' },
  { id: 'ledger-db', name: 'ledger-db', type: 'postgres' },
  { id: 'fraud-db', name: 'fraud-db', type: 'postgres' },
  { id: 'analytics-warehouse', name: 'analytics-warehouse', type: 's3' },
  { id: 'search-index', name: 'search-index', type: 'elasticsearch' },
  { id: 'notifications-db', name: 'notifications-db', type: 'postgres' },
  { id: 'session-store', name: 'session-store', type: 'redis' },
];

export const writesTo: Edge[] = [
  { from: 'auth-service', to: 'auth-db' },
  { from: 'identity-provider-service', to: 'auth-db' },
  { from: 'user-service', to: 'users-db' },
  { from: 'catalog-service', to: 'catalog-db' },
  { from: 'inventory-service', to: 'inventory-db' },
  { from: 'pricing-service', to: 'pricing-db' },
  { from: 'cart-service', to: 'cart-cache' },
  { from: 'order-service', to: 'orders-db' },
  { from: 'payment-service', to: 'orders-db' }, // shared write with order-service
  { from: 'ledger-service', to: 'ledger-db' },
  { from: 'wallet-service', to: 'ledger-db' }, // shared write with ledger-service
  { from: 'fraud-service', to: 'fraud-db' },
  { from: 'analytics-service', to: 'analytics-warehouse' },
  { from: 'search-service', to: 'search-index' },
  { from: 'notification-service', to: 'notifications-db' },
  { from: 'session-service', to: 'session-store' },
];

export const readsFrom: Edge[] = [
  { from: 'profile-service', to: 'users-db' },
  { from: 'search-service', to: 'catalog-db' },
  { from: 'warehouse-service', to: 'inventory-db' },
  { from: 'promo-service', to: 'pricing-db' },
  { from: 'tax-service', to: 'pricing-db' },
  { from: 'cart-service', to: 'cart-cache' },
  { from: 'shipping-service', to: 'orders-db' },
  { from: 'risk-scoring-service', to: 'fraud-db' },
  { from: 'reporting-service', to: 'analytics-warehouse' },
  { from: 'recommendation-service', to: 'search-index' },
  { from: 'session-service', to: 'session-store' },
  { from: 'auth-service', to: 'session-store' },
];

// ---------------------------------------------------------------------------
// Kafka topics (9) — async fan-out.
// ---------------------------------------------------------------------------

export const kafkaTopics: KafkaTopicRow[] = [
  { id: 'order-events', name: 'order-events' },
  { id: 'payment-events', name: 'payment-events' },
  { id: 'user-events', name: 'user-events' },
  { id: 'inventory-events', name: 'inventory-events' },
  { id: 'fraud-alerts', name: 'fraud-alerts' },
  { id: 'pricing-updates', name: 'pricing-updates' },
  { id: 'shipment-events', name: 'shipment-events' },
  { id: 'notification-dispatch', name: 'notification-dispatch' },
  { id: 'search-index-updates', name: 'search-index-updates' },
];

export const publishesTo: Edge[] = [
  { from: 'order-service', to: 'order-events' },
  { from: 'payment-service', to: 'payment-events' },
  { from: 'user-service', to: 'user-events' },
  { from: 'inventory-service', to: 'inventory-events' },
  { from: 'fraud-service', to: 'fraud-alerts' },
  { from: 'pricing-service', to: 'pricing-updates' },
  { from: 'shipping-service', to: 'shipment-events' },
  { from: 'notification-service', to: 'notification-dispatch' },
  { from: 'catalog-service', to: 'search-index-updates' },
];

export const consumesFrom: Edge[] = [
  // order-events
  { from: 'payment-service', to: 'order-events' },
  { from: 'shipping-service', to: 'order-events' },
  { from: 'analytics-service', to: 'order-events' },
  { from: 'notification-service', to: 'order-events' },
  // payment-events
  { from: 'ledger-service', to: 'payment-events' },
  { from: 'wallet-service', to: 'payment-events' },
  { from: 'audit-service', to: 'payment-events' },
  { from: 'fraud-service', to: 'payment-events' },
  // user-events
  { from: 'profile-service', to: 'user-events' },
  { from: 'notification-service', to: 'user-events' },
  { from: 'analytics-service', to: 'user-events' },
  { from: 'recommendation-service', to: 'user-events' },
  // inventory-events
  { from: 'warehouse-service', to: 'inventory-events' },
  { from: 'shipping-service', to: 'inventory-events' },
  { from: 'search-service', to: 'inventory-events' },
  // fraud-alerts
  { from: 'risk-scoring-service', to: 'fraud-alerts' },
  { from: 'support-service', to: 'fraud-alerts' },
  { from: 'audit-service', to: 'fraud-alerts' },
  // pricing-updates
  { from: 'promo-service', to: 'pricing-updates' },
  { from: 'tax-service', to: 'pricing-updates' },
  { from: 'cart-service', to: 'pricing-updates' },
  // shipment-events
  { from: 'carrier-service', to: 'shipment-events' },
  { from: 'notification-service', to: 'shipment-events' },
  { from: 'analytics-service', to: 'shipment-events' },
  // notification-dispatch
  { from: 'email-service', to: 'notification-dispatch' },
  { from: 'sms-service', to: 'notification-dispatch' },
  { from: 'push-service', to: 'notification-dispatch' },
  // search-index-updates
  { from: 'search-service', to: 'search-index-updates' },
];

// ---------------------------------------------------------------------------
// Synchronous call graph — DEPENDS_ON is directed caller -> callee.
// Depth is intentional: api-gateway -> order-service -> cart-service ->
// pricing-service -> catalog-service is a genuine 4-hop chain, and several
// services (identity-provider-service, catalog-service, geo-service) sit at
// the bottom with many transitive dependents for an interesting blast radius.
// ---------------------------------------------------------------------------

export const dependsOn: Edge[] = [
  { from: 'api-gateway', to: 'auth-service' },
  { from: 'api-gateway', to: 'catalog-service' },
  { from: 'api-gateway', to: 'cart-service' },
  { from: 'api-gateway', to: 'order-service' },

  { from: 'auth-service', to: 'identity-provider-service' },
  { from: 'session-service', to: 'auth-service' },
  { from: 'profile-service', to: 'user-service' },

  { from: 'inventory-service', to: 'catalog-service' },
  { from: 'pricing-service', to: 'catalog-service' },
  { from: 'promo-service', to: 'pricing-service' },
  { from: 'search-service', to: 'catalog-service' },
  { from: 'recommendation-service', to: 'search-service' },
  { from: 'recommendation-service', to: 'user-service' },

  { from: 'cart-service', to: 'catalog-service' },
  { from: 'cart-service', to: 'pricing-service' },
  { from: 'order-service', to: 'cart-service' },
  { from: 'order-service', to: 'inventory-service' },
  { from: 'order-service', to: 'pricing-service' },

  { from: 'payment-service', to: 'order-service' },
  { from: 'payment-service', to: 'fraud-service' },
  { from: 'wallet-service', to: 'payment-service' },
  { from: 'ledger-service', to: 'payment-service' },
  { from: 'ledger-service', to: 'wallet-service' },
  { from: 'tax-service', to: 'pricing-service' },
  { from: 'tax-service', to: 'geo-service' },

  { from: 'fraud-service', to: 'user-service' },
  { from: 'fraud-service', to: 'order-service' },
  { from: 'risk-scoring-service', to: 'fraud-service' },
  { from: 'support-service', to: 'order-service' },
  { from: 'support-service', to: 'user-service' },

  { from: 'shipping-service', to: 'order-service' },
  { from: 'shipping-service', to: 'inventory-service' },
  { from: 'shipping-service', to: 'geo-service' },
  { from: 'warehouse-service', to: 'inventory-service' },
  { from: 'carrier-service', to: 'shipping-service' },

  { from: 'notification-service', to: 'user-service' },
  { from: 'email-service', to: 'notification-service' },
  { from: 'sms-service', to: 'notification-service' },
  { from: 'push-service', to: 'notification-service' },

  { from: 'analytics-service', to: 'order-service' },
  { from: 'analytics-service', to: 'payment-service' },
  { from: 'analytics-service', to: 'search-service' },
  { from: 'reporting-service', to: 'analytics-service' },
  { from: 'audit-service', to: 'payment-service' },
  { from: 'audit-service', to: 'fraud-service' },
];

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

export const ownedBy: Edge[] = services.map((s) => ({ from: s.id, to: s.owner_team_id }));

// ---------------------------------------------------------------------------
// Deployment history — a handful of releases per hot-path service.
// ---------------------------------------------------------------------------

export const deployments: DeploymentRow[] = [
  { id: 'dep-001', version: 'v1.4.2', timestamp: '2026-05-02T09:15:00Z' },
  { id: 'dep-002', version: 'v1.4.3', timestamp: '2026-05-14T11:40:00Z' },
  { id: 'dep-003', version: 'v2.1.0', timestamp: '2026-05-18T16:05:00Z' },
  { id: 'dep-004', version: 'v2.1.1', timestamp: '2026-05-25T08:30:00Z' },
  { id: 'dep-005', version: 'v3.0.0', timestamp: '2026-06-01T13:20:00Z' },
  { id: 'dep-006', version: 'v3.0.1', timestamp: '2026-06-09T10:05:00Z' },
  { id: 'dep-007', version: 'v1.9.4', timestamp: '2026-06-12T14:50:00Z' },
  { id: 'dep-008', version: 'v1.9.5', timestamp: '2026-06-20T09:00:00Z' },
  { id: 'dep-009', version: 'v2.3.0', timestamp: '2026-06-27T17:10:00Z' },
  { id: 'dep-010', version: 'v2.3.1', timestamp: '2026-07-03T12:25:00Z' },
  { id: 'dep-011', version: 'v1.2.8', timestamp: '2026-07-08T09:45:00Z' },
  { id: 'dep-012', version: 'v1.2.9', timestamp: '2026-07-11T15:30:00Z' },
  { id: 'dep-013', version: 'v4.0.0', timestamp: '2026-07-15T08:00:00Z' },
  { id: 'dep-014', version: 'v1.0.6', timestamp: '2026-07-18T10:10:00Z' },
  { id: 'dep-015', version: 'v1.0.7', timestamp: '2026-07-21T13:40:00Z' },
  { id: 'dep-016', version: 'v2.0.3', timestamp: '2026-07-24T09:20:00Z' },
  { id: 'dep-017', version: 'v1.6.1', timestamp: '2026-07-27T16:15:00Z' },
  { id: 'dep-018', version: 'v3.2.0', timestamp: '2026-07-29T11:00:00Z' },
  { id: 'dep-019', version: 'v1.1.4', timestamp: '2026-08-01T09:30:00Z' },
  { id: 'dep-020', version: 'v2.5.0', timestamp: '2026-08-03T14:45:00Z' },
];

export const deploys: Edge[] = [
  { from: 'dep-001', to: 'catalog-service' },
  { from: 'dep-002', to: 'catalog-service' },
  { from: 'dep-003', to: 'order-service' },
  { from: 'dep-004', to: 'order-service' },
  { from: 'dep-005', to: 'payment-service' },
  { from: 'dep-006', to: 'payment-service' },
  { from: 'dep-007', to: 'auth-service' },
  { from: 'dep-008', to: 'auth-service' },
  { from: 'dep-009', to: 'cart-service' },
  { from: 'dep-010', to: 'cart-service' },
  { from: 'dep-011', to: 'inventory-service' },
  { from: 'dep-012', to: 'pricing-service' },
  { from: 'dep-013', to: 'fraud-service' },
  { from: 'dep-014', to: 'shipping-service' },
  { from: 'dep-015', to: 'notification-service' },
  { from: 'dep-016', to: 'search-service' },
  { from: 'dep-017', to: 'wallet-service' },
  { from: 'dep-018', to: 'api-gateway' },
  { from: 'dep-019', to: 'geo-service' },
  { from: 'dep-020', to: 'analytics-service' },
];
