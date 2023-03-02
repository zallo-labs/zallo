// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Rule, RuleKey} from './Rule.sol';
import {SelfOwned} from '../SelfOwned.sol';

abstract contract RuleManager is SelfOwned {
  event RuleAdded(RuleKey indexed key, bytes data);
  event RuleRemoved(RuleKey indexed key);
  error RuleDoesNotMatchExpectedHash(bytes actualRuleData, bytes32 expectedRuleDataHash);

  function addRule(Rule calldata rule) external payable onlySelf {
    _addRule(rule);
  }

  function _addRule(Rule calldata rule) internal {
    _ruleDataHashes()[rule.key] = keccak256(rule.data);
    emit RuleAdded(rule.key, rule.data);
  }

  function removeRule(RuleKey key) external payable onlySelf {
    delete _ruleDataHashes()[key];
    emit RuleRemoved(key);
  }

  function _getRuleDataHash(RuleKey key) internal view returns (bytes32) {
    return _ruleDataHashes()[key];
  }

  function _verifyRuleData(Rule memory rule) internal view {
    bytes32 expectedHash = _ruleDataHashes()[rule.key];
    if (keccak256(rule.data) != expectedHash)
      revert RuleDoesNotMatchExpectedHash(rule.data, expectedHash);
  }

  function _ruleDataHashes() private pure returns (mapping(RuleKey => bytes32 ruleHash) storage s) {
    assembly {
      // keccack256('Account.ruleHashes')
      s.slot := 0x09014d155d7d835fa145cc93ce960f4209afc92bbc2094712143ef95b66a840b
    }
  }
}
