// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import './Safe.sol';
import {BoolArray} from './BoolArray.sol';

contract TestSafe is Safe {
  constructor(bytes32 _groupRef, Approver[] memory _approvers)
    Safe(_groupRef, _approvers)
  {}

  function verifyMultiProof(
    bytes32 _root,
    bytes32[] calldata _proof,
    uint256[] calldata _proofFlags,
    Approver[] calldata _approvers
  ) external pure {
    return _verifyMultiProof(_root, _proof, _proofFlags, _approvers);
  }

  function getGroupMerkleRoot(bytes32 _groupRef)
    external
    view
    returns (bytes32)
  {
    return groupMerkleRoots[_groupRef];
  }

  function getLeaves(Approver[] memory _approvers)
    external
    pure
    returns (bytes32[] memory leaves)
  {
    return _getLeaves(_approvers);
  }

  function hashTx(Transaction calldata _tx) external returns (bytes32) {
    return _hashTx(_tx);
  }

  function domainSeparator() external returns (bytes32) {
    return _domainSeparator();
  }

  function threshold() external pure returns (int256) {
    return THRESHOLD;
  }

  function boolArrayLength(uint256[] calldata _bools)
    external
    pure
    returns (uint256)
  {
    return BoolArray.length(_bools);
  }

  function boolArrayAtIndex(uint256[] calldata _bools, uint256 _index)
    external
    pure
    returns (bool)
  {
    return BoolArray.atIndex(_bools, _index);
  }
}
