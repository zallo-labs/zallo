import {
  INestApplication,
  INestMicroservice,
  Injectable,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { getUserCtx } from '~/request/ctx';
import { loggingMiddleware } from './prisma.logging';

const getUserClient = (prisma: PrismaClient) =>
  prisma.$extends({
    name: 'UserClient',
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const userCtx = getUserCtx();
          const accounts = [...userCtx.accounts].map((a) => `'${a}'`).join(',');

          const [, , , response] = await prisma.$transaction([
            prisma.$queryRaw`SET LOCAL ROLE "user"`,
            prisma.$queryRaw`SELECT set_config('user.id', ${userCtx.address}, true)`,
            prisma.$queryRawUnsafe(
              `SELECT set_config('user.accounts', ARRAY[${accounts}]::text[]::text, true)`,
            ),
            query(args),
          ]);

          return response;
        },
      },
    },
  });

@Injectable()
export class PrismaService<T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions>
  implements OnModuleInit
{
  readonly asSystem: PrismaClient<T>;
  readonly asUser: ReturnType<typeof getUserClient>;

  constructor(@Optional() options?: Prisma.Subset<T, Prisma.PrismaClientOptions>) {
    this.asSystem = new PrismaClient(options);

    this.asUser = getUserClient(this.asSystem);
  }
  async onModuleInit() {
    await this.setUserPermission();
  }

  enableShutdownHooks(app: INestApplication | INestMicroservice) {
    this.asSystem.$on('beforeExit', () => app.close());
  }

  $transactionAsUser<R>(
    client: Prisma.TransactionClient | undefined,
    f: (prisma: Prisma.TransactionClient) => Promise<R>,
  ) {
    return client ? f(client) : this.asUser.$transaction((tx) => f(tx));
  }

  private async setUserPermission() {
    const [{ current_user: currentUser }] = (await this.asSystem
      .$queryRaw`SELECT current_user`) as [{ current_user: string }];

    await this.asSystem.$queryRawUnsafe(`GRANT "user" TO "${currentUser}"`);
  }
}
