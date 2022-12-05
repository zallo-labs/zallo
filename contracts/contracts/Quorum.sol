// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

type QuorumId is uint32;

struct Quorum {
  address[] approvers;
}

struct QuorumDef {
  Quorum quorum;
  QuorumId id;
}
