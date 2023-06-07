import { ZERO_ADDR, Tx, TestVerifier__factory } from 'lib';
import { deploy } from './deploy';
import { WALLET } from './wallet';

export const deployTestVerifier = async () =>
  TestVerifier__factory.connect((await deploy('TestVerifier')).address, WALLET);

export const defaultTx: Tx = {
  operations: [{ to: ZERO_ADDR }],
  nonce: 0n,
};
