import type { Session } from 'neo4j-driver';
import type { TeamNode } from '../types/graph.js';
import { assertSafeHopCount } from './util.js';

/**
 * Required query 2 — teams to notify: the distinct set of teams owning any
 * service in the blast radius (the deploying service plus every transitive
 * dependent), so a release engineer knows who to ping before deploying.
 */
export async function getTeamsToNotify(
  session: Session,
  serviceId: string,
  maxHops: number,
): Promise<TeamNode[]> {
  const hops = assertSafeHopCount(maxHops);

  const query = `
    MATCH (start:Service {id: $serviceId})
    OPTIONAL MATCH (start)<-[:DEPENDS_ON*1..${hops}]-(dependent:Service)
    WITH start, collect(DISTINCT dependent) AS dependents
    WITH start, dependents + [start] AS affected
    UNWIND affected AS svc
    MATCH (svc)-[:OWNED_BY]->(team:Team)
    RETURN DISTINCT team.id AS id, team.name AS name, team.slack_channel AS slack_channel
    ORDER BY name
  `;

  const result = await session.run(query, { serviceId });

  return result.records.map((record) => ({
    id: record.get('id') as string,
    name: record.get('name') as string,
    slack_channel: record.get('slack_channel') as string,
  }));
}
