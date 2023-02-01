import { Wallet } from 'ethers';
import { address } from 'lib';

export const randomAddress = () => address(Wallet.createRandom().address);
