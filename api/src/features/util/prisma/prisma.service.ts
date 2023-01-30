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
          const user = userParam ?? getRequestContext().user;
          if (!user) throw new Error("User must be specified when there's no request context");

          const [, result] = await prisma.$transaction([
            // Set the user context as local (transaction scoped) settings
            prisma.$executeRaw`
              SELECT (
                set_config('user.id', '${user.id}', true),
                set_config('user.accounts', ARRAY[
                  ${[...user.accounts].map((a) => `'${a}'`).join(',')}
                  ]::text, true)
              );
            `,
            query(args),
          ]);

          return result;
        },
      },
    },
  });

const getSuperuserClient = (prisma: PrismaClient) =>
  prisma.$extends({
    name: 'SuperuserClient',
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SET LOCAL role postgres;`,
            query(args),
          ]);

          return result;
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
  private baseClient: PrismaClient;
  private superuserClient: ReturnType<typeof getSuperuserClient>;

  constructor(@Optional() ...params: ConstructorParameters<typeof PrismaClient>) {
    super(...params);
    PrismaService.configure(this);
    this.baseClient = PrismaService.configure(new PrismaClient(...params));
    this.superuserClient = getSuperuserClient(this.baseClient);
  }

  async onModuleInit() {
    await this.$executeRaw`SET role "user"`;
  }

  enableShutdownHooks(app: INestApplication | INestMicroservice) {
    return this.$on('beforeExit', () => app.close());
  }

  as(user?: UserContext) {
    return getUserClient(this.baseClient, user);
  }

  get asSuperuser() {
    return this.superuserClient;
  }

  private static configure(client: PrismaClient) {
    client.$use(loggingMiddleware());
    return client;
  }
}
