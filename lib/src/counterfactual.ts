import { BytesLike } from 'ethers';
import { Factory } from './contracts';
import {
  SafeConstructorArgs,
  toSafeConstructorDeployArgsBytes,
} from './deploy';
import { address } from './addr';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import * as zk from 'zksync-web3';

export const getRandomSalt = () => hexlify(randomBytes(32));

export const calculateSafeAddress = async (
  args: SafeConstructorArgs,
  factory: Factory,
  salt: BytesLike,
) => {
  const addr = zk.utils.create2Address(
    factory.address,
    await factory.safeBytecodeHash(),
    salt,
    toSafeConstructorDeployArgsBytes(args),
  );

  return address(addr);
};
