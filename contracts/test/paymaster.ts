import { AbiParameterToPrimitiveType } from 'abitype';
import { expect } from 'chai';
import {
  getAbiItem,
  hexToBigInt,
  hexToSignature,
  maxUint256,
  parseEther,
  signatureToCompactSignature,
  zeroAddress,
  zeroHash,
} from 'viem';

import {
  Address,
  asUAddress,
  encodePaymasterInput,
  ETH_ADDRESS,
  PayForTransactionParams,
  PaymasterSignedData,
  paymasterSignedDataAsTypedData,
} from 'lib';
import TestPaymaster, { abi } from './contracts/TestPaymaster';
import { deploy, network, testNetwork, wallet } from './util';

const disabled = {
  token: zeroAddress,
  usdPriceId: zeroHash,
};

const xAbi = getAbiItem({ abi, name: 'validateAndPayForPaymasterTransaction' }).inputs[2];
type Transaction = AbiParameterToPrimitiveType<typeof xAbi>;

describe('Paymaster', () => {
  let address: Address;
  const owner = wallet.account.address;
  const signer = wallet.account.address;
  const SUCCESS = '0x038a24bc';
  const FAILURE = '0x00000000';

  before(async () => {
    address = (
      await deploy(TestPaymaster, [
        owner,
        signer,
        {
          pyth: zeroAddress,
          ethUsdPriceId: zeroHash,
          dai: disabled,
          usdc: disabled,
          weth: disabled,
          reth: disabled,
          cbeth: disabled,
        },
      ])
    ).address;
  });

  beforeEach(async () => {
    await testNetwork.setBalance({ address, value: parseEther('1') });
  });

  const getTransaction = async (
    params?: Partial<PayForTransactionParams>,
    tx?: Partial<Transaction>,
  ): Promise<Transaction> => {
    const signedData: PaymasterSignedData = {
      paymasterFee: params?.paymasterFee ?? 0n,
      discount: params?.discount ?? 0n,
    };

    return {
      txType: 0n,
      from: hexToBigInt(wallet.account.address),
      to: hexToBigInt(wallet.account.address),
      value: 0n,
      data: '0x',
      gasLimit: 0n,
      gasPerPubdataByteLimit: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      factoryDeps: [],
      nonce: 0n,
      paymaster: hexToBigInt(address),
      paymasterInput: encodePaymasterInput({
        token: ETH_ADDRESS,
        amount: 0n,
        paymasterSignature: signatureToCompactSignature(
          hexToSignature(
            await wallet.signTypedData(
              paymasterSignedDataAsTypedData({
                paymaster: asUAddress(address, network.chain.key),
                account: wallet.account.address,
                nonce: 0n,
                ...signedData,
              }),
            ),
          ),
        ),
        ...signedData,
        ...params,
      }),
      reserved: [0n, 0n, 0n, 0n],
      reservedDynamic: '0x',
      signature: '0x',
      ...tx,
    };
  };

  it('sets correct owner', async () => {
    await expect(
      network.readContract({
        address,
        abi,
        functionName: 'owner',
      }),
    ).eventually.to.eq(owner);
  });

  describe('validateAndPayForPaymasterTransaction', () => {
    it('revert when called by anyone other than bootloader', async () => {
      await expect(
        network.simulateContract({
          address,
          abi,
          functionName: 'validateAndPayForPaymasterTransaction',
          args: [zeroHash, zeroHash, await getTransaction({})],
        }),
      ).to.revertWith({ abi, errorName: 'OnlyCallableByBootloader' });
    });

    it('succeed when everything is valid', async () => {
      const { request, result } = await network.simulateContract({
        address,
        abi,
        functionName: 'testValidateAndPayForPaymasterTransaction',
        args: [await getTransaction()],
      });

      expect(result).to.eq(SUCCESS);
      await wallet.writeContract(request);
    });

    it('fail (but not revert) when allowance is less than amount required', async () => {
      const { result, request } = await network.simulateContract({
        address,
        abi,
        functionName: 'testValidateAndPayForPaymasterTransaction',
        args: [await getTransaction({ amount: 0n }, { gasLimit: 1n, maxFeePerGas: 1n })],
      });

      expect(result).to.eq(FAILURE);
      await wallet.writeContract(request);
    });

    it('revert when unable to receive payment', async () => {
      await expect(
        network.simulateContract({
          address,
          abi,
          functionName: 'testValidateAndPayForPaymasterTransaction',
          args: [await getTransaction({ amount: 1n }, { gasLimit: 1n, maxFeePerGas: 1n })],
        }),
      ).to.revertWith({ abi, errorName: 'PaymentNotRecieved' });
    });

    it('revert when bootloader payment fails', async () => {
      await testNetwork.setBalance({ address, value: 0n });
      await expect(
        network.simulateContract({
          address,
          abi,
          functionName: 'testValidateAndPayForPaymasterTransaction',
          args: [await getTransaction({ amount: 0n }, { gasLimit: 1n, maxFeePerGas: 1n })],
        }),
      ).to.revertWith({ abi, errorName: 'PaymasterLacksEth' });
    });
  });

  describe('postTransaction', () => {
    let postTransactionGasCost: bigint;
    before(async () => {
      postTransactionGasCost = await network.readContract({
        address,
        abi,
        functionName: 'postTransactionGasCost',
      });
    });

    it('revert when called by anyone other than bootloader', async () => {
      await expect(
        network.simulateContract({
          address,
          abi,
          functionName: 'postTransaction',
          args: ['0x', await getTransaction({}), zeroHash, zeroHash, 1, 0n],
        }),
      ).to.revertWith({ abi, errorName: 'OnlyCallableByBootloader' });
    });

    it('include RefundCredit event when maxRefundedGas > POST_TRANSACTION_GAS_COST', async () => {
      const expectedRefundCredit = 1000n;
      const maxRefundedGas = postTransactionGasCost + expectedRefundCredit;

      await expect(
        wallet.writeContract({
          address,
          abi,
          functionName: 'testPostTransaction',
          args: [await getTransaction({}), maxRefundedGas],
        }),
      ).to.includeEvent({
        abi,
        eventName: 'RefundCredit',
        // args: { account: wallet.account.address, amount: expectedRefundCredit },
      });
    });

    it('NOT include RefundCredit event when maxRefundedGas <= POST_TRANSACTION_GAS_COST', async () => {
      const maxRefundedGas = postTransactionGasCost;

      await expect(
        wallet.writeContract({
          address,
          abi,
          functionName: 'testPostTransaction',
          args: [await getTransaction({}), maxRefundedGas],
        }),
      ).to.not.includeEvent({ abi, eventName: 'RefundCredit' });
    });

    it('use exactly as much gas as POST_TRANSACTION_GAS_COST', async () => {
      const maxRefundedGas = maxUint256; // Includes RefundCredit event
      const { result: gasUsed, request } = await network.simulateContract({
        address,
        abi,
        functionName: 'testPostTransactionGasUsed',
        args: [
          await getTransaction(
            {},
            {
              from: maxUint256, // 0xff... address; to ensure maximum data costs
            },
          ),
          maxRefundedGas,
        ],
      });
      expect(gasUsed, 'POST_TRANSACTION_GAS_COST set to the amount of gas used').to.eq(
        postTransactionGasCost,
      );

      await wallet.writeContract(request);
    });
  });
});
