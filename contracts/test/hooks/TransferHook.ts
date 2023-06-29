import { expect } from 'chai';
import {
  AccountError,
  asHex,
  ERC20_ABI,
  Operation,
  TestVerifier,
  TRANSFERS_CONFIG_ABI,
  TransfersConfig,
} from 'lib';
import { deployTestVerifier } from '../util/verifier';
import { WALLET } from '../util';
import { encodeFunctionData } from 'viem';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

const TOKEN = WALLET.address;
const HOUR = 60 * 60;

describe('TransferHook', () => {
  let verifier = {} as TestVerifier;

  const verify = (op: Partial<Operation>, c: TransfersConfig) =>
    verifier.beforeExecuteTransfer(
      {
        to: WALLET.address,
        value: 0,
        data: '0x',
        ...op,
      },
      TRANSFERS_CONFIG_ABI.asStruct(c),
      { gasLimit: 3_000_000 },
    );

  beforeEach(async () => {
    verifier = await deployTestVerifier();
  });

  describe('succeed when', () => {
    it('transfer, below limit', async () => {
      await expect(
        verify({ value: 1n }, { limits: { [ETH_ADDRESS]: { amount: 2n, duration: HOUR } } }),
      ).to.not.be.reverted;
    });

    it('transfer, equal to limit', async () => {
      await expect(
        verify({ value: 2n }, { limits: { [ETH_ADDRESS]: { amount: 2n, duration: HOUR } } }),
      ).to.not.be.reverted;
    });

    it('erc20 transfer, equal to limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [WALLET.address, 2n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.not.be.reverted;
    });

    it('erc20 approval, equal to limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [WALLET.address, 2n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.not.be.reverted;
    });

    it('erc20 increaseAllowance, equal to limit', async () => {
      await expect(
        verify(
          {
            to: TOKEN,
            data: asHex(
              encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'increaseAllowance',
                args: [WALLET.address, 2n],
              }),
            ),
          },
          { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
        ),
      ).to.not.be.reverted;
    });
  });

  describe('revert when', () => {
    it('transfer, above limit', async () => {
      await expect(
        (
          await verify({ value: 3n }, { limits: { [ETH_ADDRESS]: { amount: 2n, duration: HOUR } } })
        ).wait(),
      ).to.be.rejected; // revertedWithCustomError(verifier, AccountError.TransferExceedsLimit);
    });

    it('erc20 transfer, above limit', async () => {
      await expect(
        (
          await verify(
            {
              to: TOKEN,
              data: asHex(
                encodeFunctionData({
                  abi: ERC20_ABI,
                  functionName: 'transfer',
                  args: [WALLET.address, 3n],
                }),
              ),
            },
            { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
          )
        ).wait(),
      ).to.be.rejected; // revertedWithCustomError(verifier, AccountError.TransferExceedsLimit);
    });

    it('erc20 approval, above limit', async () => {
      await expect(
        (
          await verify(
            {
              to: TOKEN,
              data: asHex(
                encodeFunctionData({
                  abi: ERC20_ABI,
                  functionName: 'approve',
                  args: [WALLET.address, 3n],
                }),
              ),
            },
            { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
          )
        ).wait(),
      ).to.be.rejected; // // revertedWithCustomError(verifier, AccountError.TransferExceedsLimit);
    });

    it('erc20 increaseAllowance, above limit', async () => {
      await expect(
        (
          await verify(
            {
              to: TOKEN,
              data: asHex(
                encodeFunctionData({
                  abi: ERC20_ABI,
                  functionName: 'increaseAllowance',
                  args: [WALLET.address, 3n],
                }),
              ),
            },
            { limits: { [TOKEN]: { amount: 2n, duration: HOUR } } },
          )
        ).wait(),
      ).to.be.rejected; // // revertedWithCustomError(verifier, AccountError.TransferExceedsLimit);
    });
  });
});
