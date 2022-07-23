// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '../Safe.sol';
import {BoolArray} from '../utils/BoolArray.sol';

contract TestSafe is Safe {
  function testExecuteTransaction(Transaction calldata transaction) external {
    _executeTransaction(_hashTx(transaction), transaction);
  }

  function verifyMultiProof(
    bytes32 root,
    bytes32[] calldata proof,
    uint256[] calldata proofFlags,
    Approver[] calldata approvers
  ) external pure {
    return _verifyMultiProof(root, proof, proofFlags, approvers);
  }

  function getGroupMerkleRoot(bytes32 groupRef)
    external
    view
    returns (bytes32)
  {
    return _groupMerkleRoots()[groupRef];
  }

  function hashTx(Transaction calldata transaction)
    external
    view
    returns (bytes32)
  {
    return _hashTx(transaction);
  }

  function domainSeparator() external view returns (bytes32) {
    return _domainSeparator();
  }

  function threshold() external pure returns (int256) {
    return THRESHOLD;
  }

  function boolArrayLength(uint256[] calldata bools)
    external
    pure
    returns (uint256)
  {
    return BoolArray.length(bools);
  }

  function boolArrayAtIndex(uint256[] calldata bools, uint256 index)
    external
    pure
    returns (bool)
  {
    return BoolArray.atIndex(bools, index);
  }
}
