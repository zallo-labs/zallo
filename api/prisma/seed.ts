import { AbiSource, PrismaClient } from '@prisma/client';
import { ACCOUNT_INTERFACE, Erc20__factory, asSelector } from 'lib';

const prisma = new PrismaClient();

const createContracts = async () => {
  // Interfaces in order of precedence (in case of sighash collisions)
  const interfaces = [ACCOUNT_INTERFACE, Erc20__factory.createInterface()];

  await prisma.contractFunction.createMany({
    data: interfaces.flatMap((i) =>
      Object.values(i.functions).map((f) => ({
        selector: asSelector(i.getSighash(f)),
        abi: JSON.parse(f.format('json')),
        source: AbiSource.STANDARD,
      })),
    ),
  });
};

const main = async () => {
  await createContracts();
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
