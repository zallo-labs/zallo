// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

// Fixed-point percentage with a precision of 28; e.g. 5.2% = 0.52 * 10 ** 28
// An int256 can safely hold ~7e47 uint96s (min. bytes required to store the precision)
int256 constant THRESHOLD = 10**28;

struct Approver {
  address addr;
  uint96 weight;
}

struct Group {
  mapping(address => int256) approvers;
  bytes32 approversHash;
}

struct Op {
  address to;
  uint256 value;
  bytes data;
  uint256 nonce;
}

struct Signer {
  address addr;
  bytes signature;
}
