// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

type PolicyKey is uint32;

struct Policy {
  PolicyKey key;
  Rule[] signatureRules;
  Rule[] transactionRules;
}

struct Rule {
  RuleSelector selector;
  bytes args;
}

enum RuleSelector {
  Approvals,
  Function,
  AnyOfFunctions,
  Target,
  AnyOfTargets
}

library PolicyLib {
  function hash(Policy memory policy) internal pure returns (bytes32) {
    return keccak256(abi.encode(policy.signatureRules, policy.transactionRules));
  }
}
