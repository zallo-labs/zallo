import { PrismaClient } from '@prisma/client';
import { ACCOUNT_INTERFACE, Erc20__factory } from 'lib';

const prisma = new PrismaClient();

const truncateTable = (name: string) =>
  prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${name}" CASCADE`);

const createFragments = async () => {
  // Interfaces in order of precedence (in case of sighash collisions)
  const interfaces = [ACCOUNT_INTERFACE, Erc20__factory.createInterface()];

  await prisma.contractMethod.createMany({
    data: interfaces.flatMap((i) =>
      Object.values(i.functions).map((f) => ({
        sighash: i.getSighash(f),
        fragment: f.format('json'),
      })),
    ),
    skipDuplicates: true,
  });
};

const main = async () => {
  await createFragments();
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
