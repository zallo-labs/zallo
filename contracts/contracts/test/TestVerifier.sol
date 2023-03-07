// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Verifier} from '../policy/Verifier.sol';
import {Policy, PolicyKey} from '../policy/Policy.sol';

contract TestVerifier is Verifier {
  function verifySignaturePolicy(
    Policy memory policy,
    bytes[] memory signatures,
    bytes32 txHash
  ) external view {
    return _verifySignaturePolicy(policy, signatures, txHash);
  }

  function verifyTransactionPolicy(Policy memory policy, Transaction memory t) external pure {
    return _verifyTransactionPolicy(policy, t);
  }

  function verifySignatureAndTransactionPolicy(
    Policy memory policy,
    Transaction memory t,
    bytes32 txHash,
    bytes[] memory signatures
  ) external view {
    _verifySignaturePolicy(policy, signatures, txHash);
    _verifyTransactionPolicy(policy, t);
  }
}
