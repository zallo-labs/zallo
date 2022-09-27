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

export const connectOrCreateUser = (
  account: Address,
  device: Address,
  name: string,
): Prisma.UserCreateNestedOneWithoutStatesInput => ({
  connectOrCreate: {
    where: {
      accountId_deviceId: {
        accountId: account,
        deviceId: device,
      },
    },
    create: {
      account: { connect: { id: account } },
      device: connectOrCreateDevice(device),
      name,
    },
  },
});
