import { Injectable, Provider } from '@nestjs/common';
import { execSync } from 'child_process';
import { CONFIG } from '~/config';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaMockService extends PrismaService {
  private url: string;
  private database: string;

  constructor() {
    const database = `test-${uuidv4()}`;
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
    const tablenames = await this.asSystem.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    await this.asSystem.$transaction(
      tablenames
        .filter(({ tablename }) => !tablename.startsWith('_'))
        .map(({ tablename }) =>
          this.asSystem.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`),
        ),
    );
  }

  async drop() {
    await this.asSystem.$disconnect();
    const client = new PrismaClient({ datasources: { db: { url: CONFIG.databaseUrl } } });
    await client.$executeRawUnsafe(`DROP DATABASE "${this.database}" WITH (FORCE)`);
  }
}

const MOCK_PRISMA_SERVICE = new PrismaMockService();

beforeAll(() => MOCK_PRISMA_SERVICE.setup(), 30000);
afterEach(() => MOCK_PRISMA_SERVICE.truncate());
afterAll(() => MOCK_PRISMA_SERVICE.drop());

export const PRISMA_MOCK_PROVIDER: Provider = {
  provide: PrismaService,
  useValue: MOCK_PRISMA_SERVICE,
};
