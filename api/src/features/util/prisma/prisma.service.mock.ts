import { Injectable, Provider } from '@nestjs/common';
import { execSync } from 'child_process';
import { CONFIG } from '~/config';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';
import uuid from 'uuid';

@Injectable()
export class PrismaMockService extends PrismaService {
  private url: string;
  private database: string;

  constructor() {
    const database = `test-${uuid()}`;
    const url = `${CONFIG.databaseUrl}/${database}`;
    super({ datasources: { db: { url } } });

    this.database = database;
    this.url = url;
  }

  async setup() {
    execSync(`npx prisma migrate deploy`, {
      env: {
        ...process.env,
        DATABASE_URL: this.url,
      },
    });
  }

  async truncate() {
    const tablenames = await this.asSuperuser.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    await this.asSuperuser.$transaction(
      tablenames
        .filter(({ tablename }) => !tablename.startsWith('_'))
        .map(({ tablename }) =>
          this.asSuperuser.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`),
        ),
    );
  }

  async drop() {
    await this.asSuperuser.$disconnect();
    const client = new PrismaClient({ datasources: { db: { url: CONFIG.databaseUrl } } });
    // Database will be setup if no tests are run in a file (e.g. all todos)
    await client.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${this.database}" WITH (FORCE)`);
  }
}

const MOCK_PRISMA_SERVICE = new PrismaMockService();

beforeEach(() => MOCK_PRISMA_SERVICE.setup(), 30000);
afterEach(() => MOCK_PRISMA_SERVICE.truncate());
afterAll(() => MOCK_PRISMA_SERVICE.drop());

export const PRISMA_MOCK_PROVIDER: Provider = {
  provide: PrismaService,
  useValue: MOCK_PRISMA_SERVICE,
};
