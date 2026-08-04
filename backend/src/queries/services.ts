import type { Session } from 'neo4j-driver';
import type { ServiceNode } from '../types/graph.js';

const LIST_SERVICES_QUERY = `
  MATCH (s:Service)
  RETURN s.id AS id, s.name AS name, s.tier AS tier, s.language AS language,
         s.owner_team_id AS owner_team_id
  ORDER BY s.name
`;

export async function listServices(session: Session): Promise<ServiceNode[]> {
  const result = await session.run(LIST_SERVICES_QUERY);
  return result.records.map((record) => ({
    id: record.get('id') as string,
    name: record.get('name') as string,
    tier: record.get('tier') as ServiceNode['tier'],
    language: record.get('language') as ServiceNode['language'],
    owner_team_id: record.get('owner_team_id') as string,
  }));
}

const GET_SERVICE_QUERY = `
  MATCH (s:Service {id: $serviceId})
  RETURN s.id AS id, s.name AS name, s.tier AS tier, s.language AS language,
         s.owner_team_id AS owner_team_id
`;

export async function getServiceById(session: Session, serviceId: string): Promise<ServiceNode | null> {
  const result = await session.run(GET_SERVICE_QUERY, { serviceId });
  const record = result.records[0];
  if (!record) return null;
  return {
    id: record.get('id') as string,
    name: record.get('name') as string,
    tier: record.get('tier') as ServiceNode['tier'],
    language: record.get('language') as ServiceNode['language'],
    owner_team_id: record.get('owner_team_id') as string,
  };
}
