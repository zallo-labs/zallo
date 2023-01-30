import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { URL } from 'url';
import { CONFIG } from '~/config';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaMockService extends PrismaService {
  private url: string;
  private schemaId: string;
  private isSetup = false;

  constructor() {
    const schemaId = 'tests';
    const url = PrismaMockService.generateDatabaseURL(schemaId);
    super({ datasources: { db: { url } } });
    this.schemaId = schemaId;
    this.url = url;

    console.log(CONFIG.env);
  }

  setup() {
    if (!this.isSetup) {
      execSync(`DATABASE_URL="${this.url}" npx prisma db push`, {
        env: {
          ...process.env,
          DATABASE_URL: this.url,
        },
      });
      this.$connect();
    }
    this.isSetup = true;
  }

  async teardown() {
    await this.truncate();
  }

  private async truncate() {
    const tablenames = (
      await this.$queryRaw<
        Array<{ tablename: string }>
      >`SELECT tablename FROM pg_tables WHERE schemaname='${this.schemaId}'`
    )
      .map(({ tablename }) => tablename)
      .filter((tablename) => !tablename.startsWith('_'));

    await this.$executeRawUnsafe(
      tablenames
        .map((tablename) => `TRUNCATE TABLE "${this.schemaId}"."${tablename}" CASCADE;`)
        .join(' '),
    );
  }

  private static generateDatabaseURL(schemaId: string) {
    const url = new URL(CONFIG.databaseUrl);
    url.searchParams.append('schema', schemaId);
    return url.toString();
  }
}

export const MOCK_PRISMA_SERVICE = new PrismaMockService();

beforeEach(async () => MOCK_PRISMA_SERVICE.setup());
afterEach(async () => MOCK_PRISMA_SERVICE.teardown());
