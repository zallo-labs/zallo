// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '../Account.sol';
import {BoolArray} from '../utils/BoolArray.sol';

contract TestAccount is Account {
  function testExecuteTransaction(Transaction calldata transaction) external {
    _executeTransaction(_hashTx(transaction), transaction);
  }

  function verifyMultiProof(
    bytes32 root,
    bytes32[] calldata proof,
    uint256[] calldata proofFlags,
    address[] calldata quorum
  ) external pure {
    return _verifyMultiProof(root, proof, proofFlags, quorum);
  }

  function getWalletMerkleRoot(Ref walletRef) external view returns (bytes32) {
    return _walletMerkleRoots()[walletRef];
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
