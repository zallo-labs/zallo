import { Signer } from 'ethers';
import { Safe, Safe__factory } from './typechain';

const factory = new Safe__factory();

export const connectSafe = (addr: string, signer: Signer): Safe =>
  factory.attach(addr).connect(signer);
