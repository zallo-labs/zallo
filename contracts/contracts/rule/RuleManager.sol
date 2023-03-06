// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Rule, RuleKey, RuleHelper} from './Rule.sol';
import {SelfOwned} from '../SelfOwned.sol';

abstract contract RuleManager is SelfOwned {
  using RuleHelper for Rule;

  event RuleAdded(RuleKey key, bytes32 dataHash);
  event RuleRemoved(RuleKey key);

  error RuleDoesNotMatchExpectedHash(bytes32 expectedRuleDataHash);

  function addRule(Rule calldata rule) external payable onlySelf {
    _addRule(rule);
  }

  function _addRule(Rule calldata rule) internal {
    bytes32 hash = rule.hash();
    _ruleDataHashes()[rule.key] = hash;
    emit RuleAdded(rule.key, hash);
  }

  function _addRules(Rule[] calldata rules) internal {
    uint256 rulesLen = rules.length;
    for (uint256 i; i < rulesLen; ) {
      _addRule(rules[i]);

      unchecked {
        ++i;
      }
    }
  }

  function removeRule(RuleKey key) external payable onlySelf {
    delete _ruleDataHashes()[key];
    emit RuleRemoved(key);
  }

  function _decodeAndVerifySignature(
    bytes memory signature
  ) internal view returns (Rule memory rule, bytes[] memory signatures) {
    (rule, signatures) = abi.decode(signature, (Rule, bytes[]));

    bytes32 expectedHash = _ruleDataHashes()[rule.key];
    if (rule.hash() != expectedHash) revert RuleDoesNotMatchExpectedHash(expectedHash);
  }

  function _ruleDataHashes() private pure returns (mapping(RuleKey => bytes32 ruleHash) storage s) {
    assembly {
      // keccack256('RuleManager.ruleDataHashes')
      s.slot := 0x802fed699346f5fc9a637c76639db8d2c903afbffe3d02c2f0c499f3e92c93b5
    }
  }

  function _getRuleDataHash(RuleKey key) internal view returns (bytes32) {
    return _ruleDataHashes()[key];
  }
}
