// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Rule, Condition, CONDITION_SUCCESS_MAGIC, CONDITION_FLAG_TX, CONDITION_FLAG_HASH, CONDITION_FLAG_SIGNATURES} from './Rule.sol';
import {ApproversVerifier} from './verifiers/ApproversVerifier.sol';
import {MatchingTargetVerifier} from './verifiers/MatchingTargetVerifier.sol';
import {MatchingFunctionVerifier} from './verifiers/MatchingFunctionVerifier.sol';
import {RuleManager} from './RuleManager.sol';

abstract contract RuleValidator is
  RuleManager,
  ApproversVerifier,
  MatchingTargetVerifier,
  MatchingFunctionVerifier
{
  error RuleConditionFailed(Condition condition, bytes reason);

  function _validateRule(
    Rule memory rule,
    Transaction memory t,
    bytes32 txHash,
    bytes[] memory signatures
  ) internal view {
    _verifyRuleData(rule);

    Condition[] memory conditions = _unpackData(rule.data);
    uint256 conditionsLen = conditions.length;

    for (uint256 i; i < conditionsLen; ) {
      Condition memory condition = conditions[i];

      bool successfulInternalCall = _tryInternalVerifier(condition, t, txHash, signatures);
      if (!successfulInternalCall) {
        // External or unhandled internal verifiers
        (bool success, bytes memory response) = condition.contractAddr.staticcall(
          _callDataWithContext(condition, t, txHash, signatures)
        );

        if (!success || bytes4(response) != CONDITION_SUCCESS_MAGIC)
          revert RuleConditionFailed(condition, response);
      }

      unchecked {
        ++i;
      }
    }
  }

  function _tryInternalVerifier(
    Condition memory c,
    Transaction memory t,
    bytes32 txHash,
    bytes[] memory signatures
  ) private view returns (bool success) {
    if (c.contractAddr != address(this)) return false;

    if (c.selector == _verifyApprovers.selector) {
      _verifyApprovers(abi.decode(c.args, (address[])), txHash, signatures);
    } else if (c.selector == _verifyMatchingTarget.selector) {
      _verifyMatchingTarget(abi.decode(c.args, (address)), t);
    } else if (c.selector == _verifyMatchingAnyTarget.selector) {
      _verifyMatchingAnyTarget(abi.decode(c.args, (address[])), t);
    } else if (c.selector == _verifyMatchingFunction.selector) {
      _verifyMatchingFunction(abi.decode(c.args, (bytes4)), t);
    } else if (c.selector == _verifyMatchingAnyFunction.selector) {
      _verifyMatchingAnyFunction(abi.decode(c.args, (bytes4[])), t);
    } else {
      return false;
    }

    return true;
  }

  function _callDataWithContext(
    Condition memory c,
    Transaction memory t,
    bytes32 txHash,
    bytes[] memory signatures
  ) private pure returns (bytes memory) {
    if ((c.flags & CONDITION_FLAG_TX) != 0) c.args = bytes.concat(c.args, abi.encode(t));

    if ((c.flags & CONDITION_FLAG_HASH) != 0) c.args = bytes.concat(c.args, abi.encode(txHash));

    if ((c.flags & CONDITION_FLAG_SIGNATURES) != 0)
      c.args = bytes.concat(c.args, abi.encode(signatures));

    return c.args;
  }

  function _unpackData(bytes memory ruleData) private pure returns (Condition[] memory conditions) {
    return abi.decode(ruleData, (Condition[]));
  }
}
