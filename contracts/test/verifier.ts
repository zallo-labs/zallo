import '@matterlabs/hardhat-zksync-chai-matchers';
import { expect } from 'chai';
import { BigNumber, BytesLike } from 'ethers';
import {
  Policy,
  TestVerifier,
  TestVerifier__factory,
  zeroHexBytes,
  ZERO_ADDR,
  asPolicyKey,
  POLICY_ABI,
  APPROVALS_ABI,
  asPolicy,
} from 'lib';
import { TransactionStruct } from 'lib/src/contracts/Account';
import { deploy, gasLimit, getApprovals, WALLET } from './util';
import { deployTestVerifier } from './util/verifier';

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
  value: BigNumber.from(0),
  reserved: [0, 0, 0, 0],
  data: [],
  signature: [],
  factoryDeps: [],
  paymasterInput: [],
  reservedDynamic: [],
};

interface ValidateOptions {
  tx?: TransactionStruct;
  policy: Policy;
}

describe('Verifier', () => {
  let verifier = {} as TestVerifier;

  before(async () => {
    verifier = await deployTestVerifier();
  });

  const verify = ({ tx = defaultTx, policy }: ValidateOptions) =>
    verifier.functions.verifyTransactionPermissionsAndApprovals(
      tx,
      POLICY_ABI.asStruct(policy),
      APPROVALS_ABI.asStruct({ approvals: [], approvers: policy.approvers }),
      { gasLimit },
    );

  it('succeed with no conditions', async () => {
    await verify({
      policy: asPolicy({ key: 0, approvers: new Set() }),
    });
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
