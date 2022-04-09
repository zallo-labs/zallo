import { ethers, PROVIDER } from '@ethers';
import { Erc20 } from './erc20';
import abi from './erc20.abi.json';

export { Erc20 } from './erc20';

export const getErc20Contract = (addr: string): Erc20 =>
  new ethers.Contract(addr, abi, PROVIDER) as unknown as Erc20;
