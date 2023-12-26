import {
  Address,
  encodePaymasterInput,
  PaymasterSignedData,
  PayForTransactionParams,
  paymasterSignedDataAsTypedData,
  asUAddress,
  paymasterSignedInput,
} from 'lib';
import { deploy, network, wallet } from './util';
import TestPaymasterUtil, { abi } from './contracts/TestPaymasterUtil';
import { expect } from 'chai';
import { hexToSignature, signatureToCompactSignature } from 'viem';

describe('PaymasterUtil', async () => {
  const signer = wallet.account.address;
  const account = wallet.account.address;
  const nonce = 0n;
  const signedData: PaymasterSignedData = { paymasterFee: 2n, discount: 3n };
  let address: Address;
  let params: PayForTransactionParams;

  before(async () => {
    address = (await deploy(TestPaymasterUtil)).address;
    params = {
      token: wallet.account.address,
      amount: 1n,
      ...signedData,
      paymasterSignature: signatureToCompactSignature(
        hexToSignature(
          await wallet.signTypedData(
            paymasterSignedDataAsTypedData({
              paymaster: asUAddress(address, network.chain.key),
              account,
              nonce,
              ...signedData,
            }),
          ),
        ),
      ),
    };
  });

  describe('parseInput', () => {
    it('decode correctly', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'parsePaymasterInput',
          args: [encodePaymasterInput(params), signer, account, nonce],
        }),
      ).eventually.to.deep.eq([params.token, params.amount, params.paymasterFee, params.discount]);
    });

    it("revert if paymaster signer doesn't match signature", async () => {
      const badInput = encodePaymasterInput({
        ...params,
        paymasterSignature: signatureToCompactSignature(
          hexToSignature(
            await wallet.signTypedData(
              paymasterSignedDataAsTypedData({
                paymaster: asUAddress(address, network.chain.key),
                account,
                nonce: 5n,
                ...signedData,
              }),
            ),
          ),
        ),
      });
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'parsePaymasterInput',
          args: [badInput, signer, account, nonce],
        }),
      ).to.revertWith({ abi, errorName: 'WrongPaymasterSigner', args: [signer] });
    });

    it('revert when no data is provided', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'parsePaymasterInput',
          args: ['0x', signer, account, nonce],
        }),
      ).to.revertWith({ abi, errorName: 'MissingPaymasterSelector' });
    });

    it('revert on unsupported flow', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'parsePaymasterInput',
          args: ['0x12345678', signer, account, nonce],
        }),
      ).to.revertWith({ abi, errorName: 'UnsupportedPaymasterFlow' });
    });
  });

  describe('signedInput', () => {
    it('payForTransactionFlow', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'signedInput',
          args: [encodePaymasterInput(params)],
        }),
      ).eventually.to.eq(paymasterSignedInput(params));
    });

    it('empty bytes without paymaster input', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'signedInput',
          args: ['0x'],
        }),
      ).eventually.to.eq('0x');
    });

    it('entire paymasterInput for other flows', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'signedInput',
          args: ['0x12345678'],
        }),
      ).eventually.to.eq('0x12345678');
    });
  });
});
