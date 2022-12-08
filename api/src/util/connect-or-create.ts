import { Prisma } from '@prisma/client';
import { Address, QuorumGuid, QuorumKey } from 'lib';

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

export const connectQuorum = (
  ...params: [QuorumGuid] | [Address, QuorumKey]
): Prisma.QuorumCreateNestedOneWithoutProposalsInput => ({
  connect: {
    accountId_key: {
      accountId: params.length === 1 ? params[0].account : params[0],
      key: params.length === 1 ? params[0].key : params[1],
    },
  },
});
