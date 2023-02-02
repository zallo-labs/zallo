import { Wallet } from 'ethers';
import { address } from 'lib';
import { PrismaPromise } from '@prisma/client';

export const randomAddress = () => address(Wallet.createRandom().address);

export const asPrismaPromise = <V>(v: V) => v as PrismaPromise<Awaited<V>>;
