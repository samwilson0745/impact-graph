const serviceSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    tier: { type: 'string', enum: ['critical', 'core', 'supporting'] },
    language: { type: 'string', enum: ['go', 'node', 'python', 'java', 'ruby'] },
    owner_team_id: { type: 'string' },
  },
};

const maxHopsParam = {
  name: 'maxHops',
  in: 'query',
  schema: { type: 'integer', minimum: 1, maximum: 6, default: 4 },
  description: 'How many DEPENDS_ON hops to traverse.',
};

const serviceIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
};

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ImpactGraph API',
    version: '0.1.0',
    description: 'Production change impact analysis over CognoDB (Neo4j-compatible).',
  },
  servers: [{ url: '/api' }],
  paths: {
    '/health': {
      get: {
        summary: 'Database connectivity check',
        responses: {
          '200': { description: 'CognoDB is reachable.' },
          '503': { description: 'CognoDB is unreachable.' },
        },
      },
    },
    '/services': {
      get: {
        summary: 'List all services',
        responses: {
          '200': {
            description: 'All services, for the search/select UI.',
            content: { 'application/json': { schema: { type: 'array', items: serviceSchema } } },
          },
        },
      },
    },
    '/services/{id}': {
      get: {
        summary: 'Get a single service',
        parameters: [serviceIdParam],
        responses: {
          '200': { description: 'The service.' },
          '404': { description: 'No service with that id.' },
        },
      },
    },
    '/services/{id}/blast-radius': {
      get: {
        summary: 'Blast radius — everything affected by deploying this service',
        description:
          'Genuine multi-hop variable-length traversal over DEPENDS_ON (reversed) plus a one-hop expansion to APIs, Kafka topics, databases, and teams for every affected service.',
        parameters: [serviceIdParam, maxHopsParam],
        responses: {
          '200': { description: 'Affected services, APIs, topics, databases, and teams.' },
          '404': { description: 'No service with that id.' },
          '503': { description: 'CognoDB is unreachable.' },
        },
      },
    },
    '/services/{id}/teams-to-notify': {
      get: {
        summary: 'Distinct teams owning any service in the blast radius',
        parameters: [serviceIdParam, maxHopsParam],
        responses: { '200': { description: 'Teams to notify before deploying.' } },
      },
    },
    '/services/{id}/single-points-of-failure': {
      get: {
        summary: 'Downstream dependencies this service is the sole path to',
        description:
          'Path-existence + node-membership-exclusion query: for each downstream dependency, is there any alternate route that avoids this service?',
        parameters: [serviceIdParam, maxHopsParam],
        responses: { '200': { description: 'Dependencies with no alternate path.' } },
      },
    },
    '/services/{id}/shared-database-risk': {
      get: {
        summary: 'Services indirectly at risk via a shared database',
        description: 'Services with no direct DEPENDS_ON edge that read/write a database this service also touches.',
        parameters: [serviceIdParam],
        responses: { '200': { description: 'Services sharing a database, without a direct dependency edge.' } },
      },
    },
    '/shortest-path': {
      get: {
        summary: 'Shortest path between two services',
        parameters: [
          { name: 'from', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'to', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'The shortest connecting path.' },
          '404': { description: 'No path connects the two services.' },
        },
      },
    },
    '/leaderboard/riskiest-services': {
      get: {
        summary: 'Most-depended-upon services, ranked by in-degree',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 20, default: 10 } }],
        responses: { '200': { description: 'Riskiest services to touch.' } },
      },
    },
  },
};
