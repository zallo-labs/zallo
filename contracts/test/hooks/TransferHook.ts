import { expect } from 'chai';
import { encodeFunctionData } from 'viem';

import {
  Address,
  asHex,
  encodeTransfersConfigStruct,
  ETH_ADDRESS,
  Operation,
  TEST_VERIFIER_ABI,
  TransfersConfig,
} from 'lib';
import { ERC20 } from 'lib/dapps';
import TestVerifier from '../contracts/TestVerifier';
import { deploy, wallet } from '../util';

const to = wallet.account.address;
const TOKEN = wallet.account.address;
const HOUR = 60 * 60;

describe('TransferHook', () => {
  let verifier: Address;

  const verify = (op: Partial<Operation>, c: TransfersConfig) =>
    wallet.writeContract({
      abi: TEST_VERIFIER_ABI,
      address: verifier,
      functionName: 'beforeExecuteTransfer',
      args: [
        {
          to,
          value: 0n,
          data: '0x',
          ...op,
        },
        encodeTransfersConfigStruct(c),
      ],
      gas: 2_000_000n,
    });

  beforeEach(async () => {
    verifier = (await deploy(TestVerifier)).address;
  });

  describe('succeed when', () => {
    it('transfer, below limit', async () => {
      await expect(
        verify({ value: 1n }, { limits: { [ETH_ADDRESS]: { amount: 2n, duration: HOUR } } }),
      ).to.not.revert;
    });

    it('transfer, equal to limit', async () => {
      await expect(
        verify({ value: 2n }, { limits: { [ETH_ADDRESS]: { amount: 2n, duration: HOUR } } }),
      ).to.not.revert;
    });

    it('erc20 transfer, equal to limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20,
                functionName: 'transfer',
                args: [to, 2n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.not.revert;
    });

    it('erc20 approval, equal to limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20,
                functionName: 'approve',
                args: [to, 2n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.not.revert;
    });

    it('erc20 increaseAllowance, equal to limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20,
                functionName: 'increaseAllowance',
                args: [to, 2n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.not.revert;
    });
  });

  describe('revert when', () => {
    it('transfer, above limit', async () => {
      await expect(
        verify({ value: 3n }, { limits: { [ETH_ADDRESS]: { amount: 2n, duration: HOUR } } }),
      ).to.revert; // TransferExceedsLimit
    });

    it('erc20 transfer, above limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20,
                functionName: 'transfer',
                args: [to, 3n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.revert; // TransferExceedsLimit
    });

    it('erc20 approval, above limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20,
                functionName: 'approve',
                args: [to, 3n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.revert; // TransferExceedsLimit
    });

    it('erc20 increaseAllowance, above limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20,
                functionName: 'increaseAllowance',
                args: [to, 3n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.revert; // TransferExceedsLimit
    });
  });
});
