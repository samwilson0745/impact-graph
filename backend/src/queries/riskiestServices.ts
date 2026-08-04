import type { Session } from 'neo4j-driver';
import type { RiskiestServiceEntry } from '../types/graph.js';

/**
 * Optional stretch query — "riskiest services to touch" leaderboard, ranked
 * by in-degree (how many other services directly depend on it).
 */
const RISKIEST_SERVICES_QUERY = `
  MATCH (s:Service)<-[:DEPENDS_ON]-(dependent:Service)
  WITH s, count(DISTINCT dependent) AS dependentCount
  RETURN s.id AS id, s.name AS name, s.tier AS tier, s.language AS language,
         s.owner_team_id AS owner_team_id, dependentCount
  ORDER BY dependentCount DESC, name
  LIMIT $limit
`;

export async function getRiskiestServices(session: Session, limit: number): Promise<RiskiestServiceEntry[]> {
  const result = await session.run(RISKIEST_SERVICES_QUERY, { limit: Math.trunc(limit) });

  return result.records.map((record) => ({
    id: record.get('id') as string,
    name: record.get('name') as string,
    tier: record.get('tier') as RiskiestServiceEntry['tier'],
    language: record.get('language') as RiskiestServiceEntry['language'],
    owner_team_id: record.get('owner_team_id') as string,
    dependentCount: (record.get('dependentCount') as { toNumber(): number }).toNumber(),
  }));
}
