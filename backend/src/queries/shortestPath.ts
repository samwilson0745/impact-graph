import type { Session } from 'neo4j-driver';
import type { ShortestPathResult } from '../types/graph.js';

// Upper bound is a literal (Neo4j requires this for shortestPath()), chosen
// comfortably above the dataset's actual diameter.
const MAX_PATH_HOPS = 15;

/**
 * Required query 4 — shortest path between two services, using shortestPath().
 * Traversed undirected: the question "why does A even affect B" is symmetric
 * (a coupling matters regardless of which side is the caller), so this finds
 * the shortest connecting path in either direction and reports each edge's
 * true call direction alongside it, so the UI can still render real arrows.
 */
export async function getShortestPath(
  session: Session,
  fromServiceId: string,
  toServiceId: string,
): Promise<ShortestPathResult | null> {
  const query = `
    MATCH (a:Service {id: $fromServiceId}), (b:Service {id: $toServiceId})
    MATCH path = shortestPath((a)-[:DEPENDS_ON*..${MAX_PATH_HOPS}]-(b))
    RETURN [n IN nodes(path) | {
             id: n.id, name: n.name, tier: n.tier, language: n.language, owner_team_id: n.owner_team_id
           }] AS path,
           [r IN relationships(path) | {
             from: startNode(r).id, to: endNode(r).id
           }] AS edges,
           length(path) AS hops
  `;

  const result = await session.run(query, { fromServiceId, toServiceId });
  const record = result.records[0];
  if (!record) return null;

  const nodes = record.get('path') as ShortestPathResult['path'];
  const edges = record.get('edges') as ShortestPathResult['edges'];
  const hops = (record.get('hops') as { toNumber(): number }).toNumber();

  return {
    from: nodes[0]!,
    to: nodes[nodes.length - 1]!,
    hops,
    path: nodes,
    edges,
  };
}
