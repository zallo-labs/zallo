import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  // await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."Contact" CASCADE`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
