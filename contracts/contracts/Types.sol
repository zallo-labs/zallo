// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

struct Approver {
  address addr;
  uint256 weight;
}

struct Group {
  mapping(address => uint256) approvers;
}

struct Tx {
  address to;
  uint256 value;
  bytes data;
  uint256 nonce;
}

struct SignedTx {
  Tx tx;
  bytes[] signatures;
}
