import type { Session } from 'neo4j-driver';
import type { BlastRadiusServiceEntry } from '../types/graph.js';
import { assertSafeHopCount } from './util.js';

/**
 * Required query 1 — blast radius (the centerpiece).
 *
 * DEPENDS_ON is directed caller -> callee, so "who breaks if I deploy this
 * service" is the reverse traversal: every service reachable by walking
 * DEPENDS_ON edges *backwards* from the target, up to maxHops away. This is
 * a genuine variable-length traversal (2+ hops) over the sync call graph —
 * the deploying service itself is included at hop 0 so downstream callers
 * of *its* resources (APIs/topics/databases) are reported too.
 */
export async function getBlastRadiusServices(
  session: Session,
  serviceId: string,
  maxHops: number,
): Promise<BlastRadiusServiceEntry[]> {
  const hops = assertSafeHopCount(maxHops);

  const query = `
    MATCH (start:Service {id: $serviceId})
    OPTIONAL MATCH path = (start)<-[:DEPENDS_ON*1..${hops}]-(dependent:Service)
    WITH start, dependent, min(length(path)) AS hop
    WHERE dependent IS NOT NULL
    RETURN dependent.id AS id, dependent.name AS name, dependent.tier AS tier,
           dependent.language AS language, dependent.owner_team_id AS owner_team_id,
           hop
    ORDER BY hop, name
  `;

  const result = await session.run(query, { serviceId });

  return result.records.map((record) => ({
    id: record.get('id') as string,
    name: record.get('name') as string,
    tier: record.get('tier') as BlastRadiusServiceEntry['tier'],
    language: record.get('language') as BlastRadiusServiceEntry['language'],
    owner_team_id: record.get('owner_team_id') as string,
    hop: (record.get('hop') as { toNumber(): number }).toNumber(),
  }));
}

/**
 * The induced-subgraph DEPENDS_ON edges among a set of service ids (the
 * deploying service plus everything in its blast radius) — the graph UI
 * needs the actual edges to draw the call graph, not just each service's hop
 * distance. `to` is matched freely and filtered by id afterwards rather than
 * pre-bound in the pattern, consistent with every other query here.
 */
export async function getServiceDependencyEdges(
  session: Session,
  serviceIds: string[],
): Promise<{ from: string; to: string }[]> {
  if (serviceIds.length === 0) return [];

  const query = `
    UNWIND $serviceIds AS fromId
    MATCH (a:Service {id: fromId})-[:DEPENDS_ON]->(b:Service)
    WHERE b.id IN $serviceIds
    RETURN a.id AS from, b.id AS to
  `;

  const result = await session.run(query, { serviceIds });

  return result.records.map((record) => ({
    from: record.get('from') as string,
    to: record.get('to') as string,
  }));
}
