import type { Session } from 'neo4j-driver';
import type { DatabaseNode, SharedDatabaseRiskEntry } from '../types/graph.js';

/**
 * Required query 5 — shared-database risk: services with no direct call
 * dependency on the deploying service, but that read or write a database it
 * also reads or writes. A schema change or migration on that shared database
 * can break them even though the dependency graph shows no edge at all —
 * exactly the "even without a direct dependency edge" case the objective
 * calls out.
 *
 * The direct-edge check is deliberately *not* written as
 * `NOT (start)-[:DEPENDS_ON]-(other)` with both endpoints pre-bound —
 * CognoDB's engine doesn't reliably enforce both ends of a pattern when both
 * nodes are already matched (confirmed by hand: it silently ignores the
 * second endpoint and matches any relationship off the first). Anchoring
 * only `start` and leaving the other side free, then filtering by id in a
 * WHERE clause, avoids the bug entirely.
 */
const SHARED_DATABASE_RISK_QUERY = `
  MATCH (start:Service {id: $serviceId})-[:READS_FROM|WRITES_TO]->(db:Database)
        <-[:READS_FROM|WRITES_TO]-(other:Service)
  WHERE other.id <> start.id
  WITH start, other, collect(DISTINCT db) AS sharedDatabases
  OPTIONAL MATCH (start)-[directEdge:DEPENDS_ON]-(candidate)
  WHERE candidate.id = other.id
  WITH other, sharedDatabases, directEdge
  WHERE directEdge IS NULL
  RETURN other.id AS id, other.name AS name, other.tier AS tier, other.language AS language,
         other.owner_team_id AS owner_team_id, sharedDatabases
  ORDER BY name
`;

export async function getSharedDatabaseRisk(
  session: Session,
  serviceId: string,
): Promise<SharedDatabaseRiskEntry[]> {
  const result = await session.run(SHARED_DATABASE_RISK_QUERY, { serviceId });

  return result.records.map((record) => ({
    id: record.get('id') as string,
    name: record.get('name') as string,
    tier: record.get('tier') as SharedDatabaseRiskEntry['tier'],
    language: record.get('language') as SharedDatabaseRiskEntry['language'],
    owner_team_id: record.get('owner_team_id') as string,
    sharedDatabases: (record.get('sharedDatabases') as { properties: DatabaseNode }[]).map(
      (node) => node.properties,
    ),
  }));
}
