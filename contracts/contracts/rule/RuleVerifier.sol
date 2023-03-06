// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Rule, InternalSelector, Verifier} from './Rule.sol';
import {ApproversVerifier} from './verifiers/ApproversVerifier.sol';
import {FunctionVerifier} from './verifiers/FunctionVerifier.sol';
import {TargetVerifier} from './verifiers/TargetVerifier.sol';

abstract contract RuleVerifier {
  error UnknownSignatureVerifier(InternalSelector selector);
  error UnknownTransactionVerifier(InternalSelector selector);

  function _verifySignatureRule(
    Rule memory rule,
    bytes[] memory signatures,
    bytes32 hash
  ) internal view {
    Verifier memory verifier;
    uint256 verifiersLen = rule.signatureVerifiers.length;
    for (uint256 i; i < verifiersLen; ) {
      verifier = rule.signatureVerifiers[i];

      if (verifier.selector == InternalSelector.Approvers) {
        ApproversVerifier.verifyApprovers(abi.decode(verifier.args, (address[])), hash, signatures);
      } else {
        revert UnknownSignatureVerifier(verifier.selector);
      }

      unchecked {
        ++i;
      }
    }
  }

  function _verifyTransactionRule(Rule memory rule, Transaction memory t) internal pure {
    Verifier memory verifier;
    uint256 verifiersLen = rule.signatureVerifiers.length;
    for (uint256 i; i < verifiersLen; ) {
      verifier = rule.signatureVerifiers[i];

      if (verifier.selector == InternalSelector.Function) {
        FunctionVerifier.verifyFunction(abi.decode(verifier.args, (bytes4)), t);
      } else if (verifier.selector == InternalSelector.AnyOfFunctions) {
        FunctionVerifier.verifyAnyOfFunctions(abi.decode(verifier.args, (bytes4[])), t);
      } else if (verifier.selector == InternalSelector.Target) {
        TargetVerifier.verifyTarget(abi.decode(verifier.args, (address)), t);
      } else if (verifier.selector == InternalSelector.Target) {
        TargetVerifier.verifyAnyOfTargets(abi.decode(verifier.args, (address[])), t);
      } else {
        revert UnknownTransactionVerifier(verifier.selector);
      }

      unchecked {
        ++i;
      }
    }
  }
}
