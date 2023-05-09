import { Wallet } from 'ethers';
import { asAddress } from 'lib';
import { Prisma } from '@prisma/client';
import { UserContext } from '~/request/ctx';

export const randomAddress = () => asAddress(Wallet.createRandom().address);

export const asPrismaPromise = <V>(v: V) => v as Prisma.PrismaPromise<Awaited<V>>;

export const randomUser = (): UserContext => ({
  address: randomAddress(),
  accounts: new Set(),
});
