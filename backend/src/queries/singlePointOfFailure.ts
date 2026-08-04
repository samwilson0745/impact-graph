import type { Session } from 'neo4j-driver';
import type { SinglePointOfFailureEntry } from '../types/graph.js';
import { assertSafeHopCount } from './util.js';

/**
 * Required query 3 — single point of failure detection.
 *
 * For the service being deployed (X), walks its downstream dependency chain
 * (X-[:DEPENDS_ON*]->Y, the *forward* direction — things X itself calls) and
 * flags each Y for which X is the only route in: no other service anywhere
 * in the graph can reach Y without passing through X. If X goes down, Y
 * becomes unreachable from the rest of the architecture.
 *
 * This is exactly the kind of query a relational schema makes awkward: it's
 * a path-existence check with node-membership exclusion ("does an alternate
 * path avoiding X exist?"), which in SQL means enumerating all paths via a
 * recursive CTE and anti-joining on path-node membership.
 *
 * Implemented via OPTIONAL MATCH + CASE + sum() rather than an `EXISTS {}`
 * existential subquery — CognoDB's engine doesn't correctly import the outer
 * `x`/`y` bindings into an `EXISTS {}` block (confirmed by hand: it always
 * evaluates as if no alternate path exists, over-flagging almost everything).
 * Counting alternate routes with a plain aggregation sidesteps that bug.
 */
export async function getSinglePointsOfFailure(
  session: Session,
  serviceId: string,
  maxHops: number,
): Promise<SinglePointOfFailureEntry[]> {
  const hops = assertSafeHopCount(maxHops);

  const query = `
    MATCH (x:Service {id: $serviceId})
    MATCH xPath = (x)-[:DEPENDS_ON*1..${hops}]->(y:Service)
    WITH x, y, min(length(xPath)) AS hop
    OPTIONAL MATCH altPath = (other:Service)-[:DEPENDS_ON*1..${hops}]->(y)
    WHERE other.id <> x.id
    WITH x, y, hop, altPath, other
    WITH x, y, hop,
         CASE WHEN other IS NOT NULL AND NOT x.id IN [n IN nodes(altPath) | n.id]
              THEN 1 ELSE 0 END AS hasAlternate
    WITH x, y, hop, sum(hasAlternate) AS alternateCount
    WHERE alternateCount = 0
    RETURN y.id AS id, y.name AS name, y.tier AS tier, y.language AS language,
           y.owner_team_id AS owner_team_id, hop
    ORDER BY hop, name
  `;

  const result = await session.run(query, { serviceId });

  return result.records.map((record) => ({
    dependency: {
      id: record.get('id') as string,
      name: record.get('name') as string,
      tier: record.get('tier') as SinglePointOfFailureEntry['dependency']['tier'],
      language: record.get('language') as SinglePointOfFailureEntry['dependency']['language'],
      owner_team_id: record.get('owner_team_id') as string,
    },
    hop: (record.get('hop') as { toNumber(): number }).toNumber(),
  }));
}
