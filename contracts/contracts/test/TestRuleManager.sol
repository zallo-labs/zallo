// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {RuleManager, Rule, RuleKey} from '../rule/RuleManager.sol';

contract TestRuleManager is RuleManager {
  function testAddRule(Rule calldata rule) external {
    this.addRule(rule);
  }

  function testRemoveRule(RuleKey key) external {
    this.removeRule(key);
  }

  function getRuleDataHash(RuleKey key) external view returns (bytes32) {
    return _getRuleDataHash(key);
  }
}
