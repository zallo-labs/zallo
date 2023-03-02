// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

type RuleKey is uint256;

struct Rule {
  RuleKey key;
  bytes data;
}

bytes4 constant CONDITION_SUCCESS_MAGIC = 0xf85707c1; // bytes4(keccak256("Condition.success"));

uint8 constant CONDITION_CONTEXT_TX = 2 >> 0;
uint8 constant CONDITION_CONTEXT_HASH = 2 >> 1;
uint8 constant CONDITION_CONTEXT_SIGNATURES = 2 >> 3;

struct Condition {
  address contractAddr;
  bytes4 selector;
  uint8 context; // 0 0 0 0 0 signatures hash tx
  bytes args;
}
