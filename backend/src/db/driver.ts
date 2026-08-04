// CognoDB (Neo4j-compatible) driver connection layer for the API server.
// Kept separate from src/seed/connection.ts so the seed script has zero
// runtime dependency on the backend, per the project's phase split.
import neo4j, { type Driver, type Session } from 'neo4j-driver';
import { env } from '../config/env.js';

let driver: Driver | undefined;

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(env.COGNODB_URI, neo4j.auth.basic(env.COGNODB_USER, env.COGNODB_PASSWORD), {
      maxConnectionPoolSize: 20,
      connectionAcquisitionTimeout: 10_000,
      connectionTimeout: 10_000,
    });
  }
  return driver;
}

export function getSession(): Session {
  return getDriver().session();
}

export async function verifyDbConnectivity(): Promise<boolean> {
  try {
    await getDriver().verifyConnectivity();
    return true;
  } catch {
    return false;
  }
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = undefined;
  }
}

/** Runs `work` with a managed session, always closing it afterwards. */
export async function withSession<T>(work: (session: Session) => Promise<T>): Promise<T> {
  const session = getSession();
  try {
    return await work(session);
  } finally {
    await session.close();
  }
}

const UNREACHABLE_ERROR_CODES = new Set([
  'ServiceUnavailable',
  'SessionExpired',
  'ConnectionTimeout',
  'ConnectionAcquisitionTimeout',
]);

/** True for driver errors that mean "couldn't reach CognoDB", as opposed to a bad query. */
export function isDatabaseUnreachableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: unknown }).code) : '';
  if ([...UNREACHABLE_ERROR_CODES].some((c) => code.includes(c))) return true;
  const name = 'name' in error ? String((error as { name?: unknown }).name) : '';
  return name === 'Neo4jError' && /ServiceUnavailable|SessionExpired|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(
    String((error as { message?: unknown }).message ?? ''),
  );
}
