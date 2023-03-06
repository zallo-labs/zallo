// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {RuleVerifier} from '../rule/RuleVerifier.sol';
import {Rule, RuleKey} from '../rule/Rule.sol';

contract TestRuleVerifier is RuleVerifier {
  function verifySignatureRule(
    Rule memory rule,
    bytes[] memory signatures,
    bytes32 txHash
  ) external view {
    return _verifySignatureRule(rule, signatures, txHash);
  }

  function verifyTransactionRule(Rule memory rule, Transaction memory t) external pure {
    return _verifyTransactionRule(rule, t);
  }

  function verifySignatureAndTransactionRules(
    Rule memory rule,
    Transaction memory t,
    bytes32 txHash,
    bytes[] memory signatures
  ) external view {
    _verifySignatureRule(rule, signatures, txHash);
    _verifyTransactionRule(rule, t);
  }
}
