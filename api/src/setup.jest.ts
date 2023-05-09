import 'ts-node/register';
import { createClient } from 'edgedb';
import { execSync } from 'child_process';

const EDGEDB_DATABASE_ENV = 'EDGEDB_DATABASE';

export default async () => {
  const database = 'tests'; // `test_${Math.random().toString(36).slice(2, 12)}`;
  const client = createClient();

  try {
    await client.query(`create database ${database}`);
  } catch (e) {
    if (!(e as Error).message?.includes('already exists')) throw e;
  }

  process.env[EDGEDB_DATABASE_ENV] = database;

  execSync(`edgedb migration apply`, {
    env: {
      ...process.env,
      [EDGEDB_DATABASE_ENV]: database,
    },
  });
};
