// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

type RuleKey is uint256;

struct Rule {
  RuleKey key;
  Verifier[] signatureVerifiers;
  Verifier[] txVerifiers;
}

struct Verifier {
  InternalSelector selector;
  bytes args;
}

enum InternalSelector {
  Approvers,
  Function,
  AnyOfFunctions,
  Target,
  AnyOfTargets
}

library RuleHelper {
  function hash(Rule memory rule) internal pure returns (bytes32) {
    return keccak256(abi.encode(rule.signatureVerifiers, rule.txVerifiers));
  }
}
