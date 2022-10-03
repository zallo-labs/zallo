import { Prisma } from '@prisma/client';
import { Address } from 'lib';

export const connectAccount = (
  account: Address,
): Prisma.AccountCreateNestedOneWithoutProposalsInput => ({
  connect: { id: account },
});

export const connectOrCreateDevice = (
  device: Address,
): Prisma.DeviceCreateNestedOneWithoutApprovalsInput => ({
  connectOrCreate: {
    where: { id: device },
    create: { id: device },
  },
});
