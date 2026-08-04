// Seed loader — writes the fictional microservice dataset (./data.ts) into
// CognoDB via the official Neo4j driver. Every query is parameterized and
// keyed on `id`, so re-running this script is idempotent.
//
// Usage: npm run seed   (reads COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD from env)

import type { Driver, Session } from 'neo4j-driver';
import { createSeedDriver } from './connection.js';
import {
  type Edge,
  apis,
  consumesFrom,
  databases,
  deploys,
  deployments,
  dependsOn,
  exposes,
  kafkaTopics,
  ownedBy,
  publishesTo,
  readsFrom,
  services,
  teams,
  writesTo,
} from './data.js';

const NODE_LABELS = ['Service', 'API', 'Database', 'KafkaTopic', 'Team', 'Deployment'] as const;

async function ensureConstraints(session: Session): Promise<void> {
  for (const label of NODE_LABELS) {
    await session.run(
      `CREATE CONSTRAINT ${label.toLowerCase()}_id_unique IF NOT EXISTS
       FOR (n:${label}) REQUIRE n.id IS UNIQUE`,
    );
  }
}

async function mergeNodes<T extends { id: string }>(
  session: Session,
  label: string,
  rows: T[],
): Promise<void> {
  await session.run(
    `UNWIND $rows AS row
     MERGE (n:${label} {id: row.id})
     SET n += row`,
    { rows },
  );
  console.log(`  ${label}: ${rows.length} nodes`);
}

async function mergeRelationships(
  session: Session,
  fromLabel: string,
  relType: string,
  toLabel: string,
  edges: Edge[],
): Promise<void> {
  await session.run(
    `UNWIND $edges AS edge
     MATCH (a:${fromLabel} {id: edge.from})
     MATCH (b:${toLabel} {id: edge.to})
     MERGE (a)-[:${relType}]->(b)`,
    { edges },
  );
  console.log(`  (${fromLabel})-[:${relType}]->(${toLabel}): ${edges.length} relationships`);
}

async function seed(driver: Driver): Promise<void> {
  const session = driver.session();
  try {
    console.log('Creating uniqueness constraints...');
    await ensureConstraints(session);

    console.log('Loading nodes...');
    await mergeNodes(session, 'Team', teams);
    await mergeNodes(session, 'Service', services);
    await mergeNodes(session, 'API', apis);
    await mergeNodes(session, 'Database', databases);
    await mergeNodes(session, 'KafkaTopic', kafkaTopics);
    await mergeNodes(session, 'Deployment', deployments);

    console.log('Loading relationships...');
    await mergeRelationships(session, 'Service', 'DEPENDS_ON', 'Service', dependsOn);
    await mergeRelationships(session, 'Service', 'EXPOSES', 'API', exposes);
    await mergeRelationships(session, 'Service', 'PUBLISHES_TO', 'KafkaTopic', publishesTo);
    await mergeRelationships(session, 'Service', 'CONSUMES_FROM', 'KafkaTopic', consumesFrom);
    await mergeRelationships(session, 'Service', 'READS_FROM', 'Database', readsFrom);
    await mergeRelationships(session, 'Service', 'WRITES_TO', 'Database', writesTo);
    await mergeRelationships(session, 'Service', 'OWNED_BY', 'Team', ownedBy);
    await mergeRelationships(session, 'Deployment', 'DEPLOYS', 'Service', deploys);

    console.log('\nSeed complete.');
  } finally {
    await session.close();
  }
}

async function main(): Promise<void> {
  let driver: Driver | undefined;
  try {
    driver = createSeedDriver();
    await driver.verifyConnectivity();
    console.log('Connected to CognoDB.\n');
    await seed(driver);
  } catch (error) {
    console.error('\nSeed failed — could not reach or write to CognoDB.');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await driver?.close();
  }
}

main();
