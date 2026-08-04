// Self-contained CognoDB connection for the seed script. Deliberately does not
// import from src/db (the backend's driver layer, built in Phase 3) so this
// script stays runnable on its own: `npm run seed`.
import 'dotenv/config';
import neo4j, { type Driver } from 'neo4j-driver';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createSeedDriver(): Driver {
  const uri = requireEnv('COGNODB_URI');
  const user = requireEnv('COGNODB_USER');
  const password = requireEnv('COGNODB_PASSWORD');

  return neo4j.driver(uri, neo4j.auth.basic(user, password));
}
