import 'ts-node/register';
import { createClient } from 'edgedb';
import { execSync } from 'child_process';

export default async () => {
  const database = 'tests'; // `test_${Math.random().toString(36).slice(2, 12)}`;
  const client = createClient();

  try {
    await client.query(`create database ${database}`);
  } catch (e) {
    if (!(e as Error).message?.includes('already exists')) throw e;
  }

  process.env['EDGEDB_DATABSAE'] = database;

  execSync(`edgedb migration apply`, {
    env: {
      ...process.env,
      EDGEDB_DATABASE: database,
    },
  });
};
