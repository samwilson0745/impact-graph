import type { Session } from 'neo4j-driver';
import { getBlastRadiusServices, getServiceDependencyEdges } from '../queries/blastRadius.js';
import { getImpactFootprint } from '../queries/impactFootprint.js';
import { getServiceById } from '../queries/services.js';
import { NotFoundError } from '../types/errors.js';
import type {
  ApiImpact,
  BlastRadiusResult,
  DatabaseImpact,
  TopicImpact,
} from '../types/graph.js';

/**
 * Orchestrates the blast-radius traversal (query 1) with the per-service
 * impact footprint (APIs/topics/databases/team) into the single aggregated
 * view the UI needs: affected services, APIs going down, topics affected —
 * tagged with publisher/consumer role — databases touched, and teams to
 * notify (query 2's data folded in here rather than a second round trip).
 */
export async function getBlastRadius(
  session: Session,
  serviceId: string,
  maxHops: number,
): Promise<BlastRadiusResult> {
  const service = await getServiceById(session, serviceId);
  if (!service) {
    throw new NotFoundError(`No service with id "${serviceId}"`);
  }

  const affectedServices = await getBlastRadiusServices(session, serviceId, maxHops);
  const allServiceIds = [serviceId, ...affectedServices.map((s) => s.id)];
  const footprints = await getImpactFootprint(session, allServiceIds);
  const serviceEdges = await getServiceDependencyEdges(session, allServiceIds);

  const apis: ApiImpact[] = [];
  const topicsById = new Map<string, TopicImpact>();
  const databasesById = new Map<string, DatabaseImpact>();
  const teamIds = new Set<string>();
  const teamsById = new Map<string, BlastRadiusResult['teams'][number]>();

  for (const footprint of footprints) {
    for (const api of footprint.apis) {
      apis.push({ ...api, serviceId: footprint.serviceId });
    }

    for (const topic of footprint.publishedTopics) {
      const entry = topicsById.get(topic.id) ?? { ...topic, publishers: [], consumers: [] };
      entry.publishers.push(footprint.serviceId);
      topicsById.set(topic.id, entry);
    }
    for (const topic of footprint.consumedTopics) {
      const entry = topicsById.get(topic.id) ?? { ...topic, publishers: [], consumers: [] };
      entry.consumers.push(footprint.serviceId);
      topicsById.set(topic.id, entry);
    }

    for (const db of footprint.readsFromDatabases) {
      const entry = databasesById.get(db.id) ?? { ...db, readers: [], writers: [] };
      entry.readers.push(footprint.serviceId);
      databasesById.set(db.id, entry);
    }
    for (const db of footprint.writesToDatabases) {
      const entry = databasesById.get(db.id) ?? { ...db, readers: [], writers: [] };
      entry.writers.push(footprint.serviceId);
      databasesById.set(db.id, entry);
    }

    if (footprint.team && !teamIds.has(footprint.team.id)) {
      teamIds.add(footprint.team.id);
      teamsById.set(footprint.team.id, footprint.team);
    }
  }

  return {
    service,
    maxHops,
    affectedServices,
    serviceEdges,
    apis,
    kafkaTopics: [...topicsById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    databases: [...databasesById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    teams: [...teamsById.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}
