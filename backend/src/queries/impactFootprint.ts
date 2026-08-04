import type { Session } from 'neo4j-driver';
import type { ApiNode, DatabaseNode, KafkaTopicNode, ServiceImpactFootprint, TeamNode } from '../types/graph.js';

/**
 * Companion to the blast-radius traversal: for a given set of already-affected
 * service ids, gathers each one's exposed APIs, published/consumed Kafka
 * topics, read/written databases, and owning team.
 *
 * Each OPTIONAL MATCH is chained rather than wrapped in an imported `CALL {
 * WITH s ... }` subquery — CognoDB's Cypher engine doesn't propagate the
 * imported variable correctly through those (confirmed by hand: a `CALL {
 * WITH s MATCH (s)-...}` returns an empty result even though the identical
 * pattern works outside a CALL block). Chained OPTIONAL MATCHes do multiply
 * rows per service internally, but every returned collection is
 * `collect(DISTINCT ...)`, so the duplication never reaches the result.
 */
const IMPACT_FOOTPRINT_QUERY = `
  UNWIND $serviceIds AS sid
  MATCH (s:Service {id: sid})
  OPTIONAL MATCH (s)-[:EXPOSES]->(api:API)
  OPTIONAL MATCH (s)-[:PUBLISHES_TO]->(pub:KafkaTopic)
  OPTIONAL MATCH (s)-[:CONSUMES_FROM]->(sub:KafkaTopic)
  OPTIONAL MATCH (s)-[:READS_FROM]->(readDb:Database)
  OPTIONAL MATCH (s)-[:WRITES_TO]->(writeDb:Database)
  OPTIONAL MATCH (s)-[:OWNED_BY]->(team:Team)
  RETURN s.id AS serviceId,
         collect(DISTINCT api) AS apis,
         collect(DISTINCT pub) AS published,
         collect(DISTINCT sub) AS consumed,
         collect(DISTINCT readDb) AS reads,
         collect(DISTINCT writeDb) AS writes,
         collect(DISTINCT team) AS teams
`;

function toApi(node: unknown): ApiNode {
  const props = (node as { properties: ApiNode }).properties;
  return { id: props.id, name: props.name, path: props.path };
}

function toTopic(node: unknown): KafkaTopicNode {
  const props = (node as { properties: KafkaTopicNode }).properties;
  return { id: props.id, name: props.name };
}

function toDatabase(node: unknown): DatabaseNode {
  const props = (node as { properties: DatabaseNode }).properties;
  return { id: props.id, name: props.name, type: props.type };
}

function toTeam(node: unknown): TeamNode {
  const props = (node as { properties: TeamNode }).properties;
  return { id: props.id, name: props.name, slack_channel: props.slack_channel };
}

export async function getImpactFootprint(
  session: Session,
  serviceIds: string[],
): Promise<ServiceImpactFootprint[]> {
  if (serviceIds.length === 0) return [];

  const result = await session.run(IMPACT_FOOTPRINT_QUERY, { serviceIds });

  return result.records.map((record) => {
    const teams = (record.get('teams') as unknown[]).filter(Boolean).map(toTeam);
    return {
      serviceId: record.get('serviceId') as string,
      apis: (record.get('apis') as unknown[]).filter(Boolean).map(toApi),
      publishedTopics: (record.get('published') as unknown[]).filter(Boolean).map(toTopic),
      consumedTopics: (record.get('consumed') as unknown[]).filter(Boolean).map(toTopic),
      readsFromDatabases: (record.get('reads') as unknown[]).filter(Boolean).map(toDatabase),
      writesToDatabases: (record.get('writes') as unknown[]).filter(Boolean).map(toDatabase),
      team: teams[0] ?? null,
    };
  });
}
