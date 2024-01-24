import 'ts-node/register';
import { createClient } from 'edgedb';
import { execSync } from 'child_process';

const EDGEDB_DATABASE_ENV = 'EDGEDB_DATABASE';

export default async () => {
  const database = 'tests';
  const client = createClient();

  try {
    await client.query(`create database ${database}`);
  } catch (e) {
    if (!(e as Error).message?.includes('already exists')) throw e;
  } finally {
    await client.close();
  }

  process.env[EDGEDB_DATABASE_ENV] = database;

  const devMode = process.env.TESTS_MIGRATE_DEV_MODE === 'true' ? '--dev-mode' : '';
  execSync(`edgedb migrate ${devMode} && yarn db:seed`, { env: process.env });
};
