// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Policy, RuleSelector, Rule} from './Policy.sol';
import {ApprovalsRule} from './rules/ApprovalsRule.sol';
import {FunctionRule} from './rules/FunctionRule.sol';
import {TargetRule} from './rules/TargetRule.sol';

abstract contract Verifier {
  error UnknownSignatureRule(RuleSelector selector);
  error UnknownTransactionRule(RuleSelector selector);

  function _verifySignaturePolicy(
    Policy memory policy,
    bytes[] memory signatures,
    bytes32 hash
  ) internal view {
    Rule memory rule;
    uint256 rulesLen = policy.signatureRules.length;
    for (uint256 i; i < rulesLen; ) {
      rule = policy.signatureRules[i];

      if (rule.selector == RuleSelector.Approvals) {
        ApprovalsRule.verifyApprovals(abi.decode(rule.args, (address[])), hash, signatures);
      } else {
        revert UnknownSignatureRule(rule.selector);
      }

      unchecked {
        ++i;
      }
    }
  }

  function _verifyTransactionPolicy(Policy memory policy, Transaction memory t) internal pure {
    Rule memory rule;
    uint256 verifiersLen = policy.transactionRules.length;
    for (uint256 i; i < verifiersLen; ) {
      rule = policy.transactionRules[i];

      if (rule.selector == RuleSelector.Function) {
        FunctionRule.verifyFunction(abi.decode(rule.args, (bytes4)), t);
      } else if (rule.selector == RuleSelector.AnyOfFunctions) {
        FunctionRule.verifyAnyOfFunctions(abi.decode(rule.args, (bytes4[])), t);
      } else if (rule.selector == RuleSelector.Target) {
        TargetRule.verifyTarget(abi.decode(rule.args, (address)), t);
      } else if (rule.selector == RuleSelector.Target) {
        TargetRule.verifyAnyOfTargets(abi.decode(rule.args, (address[])), t);
      } else {
        revert UnknownTransactionRule(rule.selector);
      }

      unchecked {
        ++i;
      }
    }
  }
}
