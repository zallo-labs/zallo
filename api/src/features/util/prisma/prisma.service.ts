import {
  INestApplication,
  INestMicroservice,
  Injectable,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getRequestContext, UserContext } from '~/request/ctx';
import { loggingMiddleware } from './prisma.logging';

const getUserClient = (prisma: PrismaClient, userParam?: UserContext) =>
  prisma.$extends({
    name: 'UserClient',
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const user = userParam ?? getRequestContext()?.user;
          if (!user) throw new Error("User must be specified when there's no request context");
          const accounts = [...user.accounts].map((a) => `'${a}'`).join(',');

          const [, , , response] = await prisma.$transaction([
            prisma.$queryRaw`SET LOCAL ROLE "user"`,
            prisma.$queryRaw`SELECT set_config('user.id', ${user.id}, true)`,
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

// A hack to allow PrismaService.this to be an extended client
class UserPrismaClient extends PrismaClient {
  constructor(...params: ConstructorParameters<typeof PrismaClient>) {
    super(...params);
    return getUserClient(this) as PrismaClient;
  }
}

@Injectable()
export class PrismaService extends UserPrismaClient implements OnModuleInit {
  private superuserClient: PrismaClient;
  private userClient: ReturnType<typeof getUserClient>;

  constructor(@Optional() ...params: ConstructorParameters<typeof PrismaClient>) {
    super(...params);
    PrismaService.configure(this);

    this.superuserClient = PrismaService.configure(new PrismaClient(...params));
    this.userClient = getUserClient(this.superuserClient);
  }

  async onModuleInit() {
    await this.$executeRaw`SET ROLE "user"`;
  }

  enableShutdownHooks(app: INestApplication | INestMicroservice) {
    return this.$on('beforeExit', () => app.close());
  }

  get asUser() {
    return this.userClient;
  }

  get asSuperuser() {
    return this.superuserClient;
  }

  private static configure(client: PrismaClient) {
    client.$use(loggingMiddleware());
    return client;
  }
}
