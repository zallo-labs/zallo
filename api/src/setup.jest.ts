import 'ts-node/register';
import { createClient } from 'edgedb';
import { execSync } from 'child_process';

export default async () => {
  const client = createClient();
  const branch = 'tests';

  try {
    await client.query(`create empty branch ${branch}`);
  } catch (e) {
    if (!(e as Error).message?.includes('already exists')) throw e;
  } finally {
    await client.close();
  }

  process.env['EDGEDB_BRANCH'] = branch;

  const devMode = process.env.TESTS_MIGRATE_DEV_MODE === 'true' ? '--dev-mode' : '';
  execSync(`edgedb migrate ${devMode} && yarn db:seed`, { env: process.env });
};
