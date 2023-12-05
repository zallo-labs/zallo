import {
  Address,
  encodePaymasterInput,
  PaymasterSignedData,
  PayForTransactionParams,
  paymasterSignedDataAsTypedData,
  Hex,
  asUAddress,
} from 'lib';
import { deploy, network, wallet } from './util';
import { abi } from './contracts/TestPaymasterUtil';
import { expect } from 'chai';
import { hexToSignature, signatureToCompactSignature } from 'viem';

describe('PaymasterUtil', async () => {
  const signer = wallet.account.address;
  const account = wallet.account.address;
  const nonce = 0n;
  const signedData: PaymasterSignedData = { paymasterFee: 2n, discount: 3n };
  let address: Address;
  let params: PayForTransactionParams;
  let input: Hex;

  before(async () => {
    address = (await deploy('TestPaymasterUtil')).address;
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
    input = encodePaymasterInput(params);
  });

  describe('parseInput', () => {
    it('decode correctly', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'parsePaymasterInput',
          args: [input, signer, account, nonce],
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

  describe('hashInput', () => {
    it('hash payForTransactionFlow', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'hash',
          args: [input],
        }),
      ).eventually.to.eq('0x8676cc52c366f89d93b5e0e45acc96936b5d6e8739ae9cdb05d57237a125a04b');
    });

    it('hash entire paymasterInput for other flows', async () => {
      await expect(
        network.readContract({
          address,
          abi,
          functionName: 'hash',
          args: ['0x12345678'],
        }),
      ).eventually.to.eq('0x30ca65d5da355227c97ff836c9c6719af9d3835fc6bc72bddc50eeecc1bb2b25');
    });
  });
});
