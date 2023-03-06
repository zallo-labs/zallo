import '@matterlabs/hardhat-zksync-chai-matchers';
import { expect } from 'chai';
import { BytesLike } from 'ethers';
import {
  address,
  Rule,
  Verifier,
  TestRuleVerifier,
  TestRuleVerifier__factory,
  ZERO,
  zeroHexBytes,
  ZERO_ADDR,
} from 'lib';
import { TransactionStruct } from 'lib/src/contracts/Account';
import { deploy, gasLimit, WALLET } from './util';

const defaultTx: TransactionStruct = {
  txType: 0,
  from: ZERO_ADDR,
  to: ZERO_ADDR,
  gasLimit: 0,
  gasPerPubdataByteLimit: 0,
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 0,
  paymaster: ZERO_ADDR,
  nonce: 0,
  value: ZERO,
  reserved: [0, 0, 0, 0],
  data: [],
  signature: [],
  factoryDeps: [],
  paymasterInput: [],
  reservedDynamic: [],
};

const defaultTxHash = zeroHexBytes(32);

interface ValidateOptions {
  verifiers: Verifier[];
  tx?: TransactionStruct;
  txHash?: string;
  signatures?: BytesLike[];
}

describe('RuleVerifier', () => {
  let verifier = {} as TestRuleVerifier;

  before(async () => {
    verifier = TestRuleVerifier__factory.connect(
      (await deploy('TestRuleVerifier')).address,
      WALLET,
    );
  });

  const verify = ({
    verifiers,
    tx = defaultTx,
    txHash = defaultTxHash,
    signatures = [],
  }: ValidateOptions) =>
    verifier.functions.verifySignatureAndTransactionRules(
      new Rule(1, verifiers).struct,
      tx,
      txHash,
      signatures,
      { gasLimit },
    );

  it('succeed with no conditions', async () => {
    await verify({ verifiers: [] });
  });

  // it('succeed with AlwaysPassVerifier', async () => {
  //   await (
  //     await verify({
  //       conditions: [
  //         {
  //           type: 'Generic',
  //           contract: address(testVerifiers.address),
  //           selector: testVerifiers.interface.getSighash(
  //             testVerifiers.interface.functions['alwaysVerify()'],
  //           ),
  //           context: {},
  //           args: [],
  //         },
  //       ],
  //     })
  //   ).wait();
  // });

  // it('Passes through contexts', async () => {
  //   await (
  //     await verify({
  //       conditions: [
  //         {
  //           type: 'Generic',
  //           contract: address(testVerifiers.address),
  //           selector: testVerifiers.interface.getSighash(
  //             testVerifiers.interface.functions[
  //               'verifyUsingContexts((uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256[4],bytes,bytes,bytes32[],bytes,bytes),bytes32,bytes[])'
  //             ],
  //           ),
  //           context: {
  //             tx: true,
  //             hash: true,
  //             signatures: true,
  //           },
  //           args: [],
  //         },
  //       ],
  //     })
  //   ).wait();
  // });

  // it('revert with AlwaysFailsVerifier', async () => {
  //   await expect(
  //     (
  //       await verify({
  //         conditions: [
  //           {
  //             type: 'Generic',
  //             contract: address(testVerifiers.address),
  //             selector: testVerifiers.interface.getSighash(
  //               testVerifiers.interface.functions['alwaysRevertVerify()'],
  //             ),
  //             context: {},
  //             args: [],
  //           },
  //         ],
  //       })
  //     ).wait(),
  //   ).to.be.rejected;
  // });

  it('revert message contains reverting condition', async () => {
    // TODO:
  });

  it('revert message contains verifier revert reason', async () => {
    // TODO
  });
});
