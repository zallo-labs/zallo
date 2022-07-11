// SPDX-License-Identifier: MIT
// Modification of https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol

pragma solidity ^0.8.0;

import {BoolArray} from './BoolArray.sol';

library MerkleProof {
  error LeavesRequired();
  error InvalidMultiProof();

  function merkleRoot(bytes32[] memory leaves)
    internal
    pure
    returns (bytes32 root)
  {
    // This function rebuild the root hash by traversing the tree up from the leaves. The root is rebuilt by
    // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
    // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
    // the merkle tree.
    uint256 leavesLen = leaves.length;
    if (leavesLen == 0) revert LeavesRequired();

    uint256 totalHashes = leavesLen - 1;

    // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
    // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
    bytes32[] memory hashes = new bytes32[](totalHashes);
    uint256 leafPos = 0;
    uint256 hashPos = 0;
    // At each step, we compute the next hash using two values:
    // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
    //   get the next hash.
    // - depending on the flag, either another value for the "main queue" (merging branches) or an element from the
    //   `proof` array.
    bytes32 a;
    bytes32 b;
    for (uint256 i = 0; i < totalHashes; ) {
      a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
      b = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
      hashes[i] = _hashPair(a, b);

      unchecked {
        ++i;
      }
    }

    if (totalHashes > 0) {
      return hashes[totalHashes - 1];
    } else {
      return leaves[0];
    }
  }

  function processMultiProof(
    bytes32[] memory proof,
    uint256[] memory proofFlags,
    bytes32[] memory leaves
  ) internal pure returns (bytes32) {
    // This function rebuild the root hash by traversing the tree up from the leaves. The root is rebuilt by
    // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
    // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
    // the merkle tree.
    uint256 leavesLen = leaves.length;
    uint256 totalHashes = BoolArray.length(proofFlags);

    // Check proof validity.
    if (leavesLen + proof.length - 1 != totalHashes) revert InvalidMultiProof();

    // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
    // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
    bytes32[] memory hashes = new bytes32[](totalHashes);
    uint256 leafPos = 0;
    uint256 hashPos = 0;
    uint256 proofPos = 0;
    // At each step, we compute the next hash using two values:
    // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
    //   get the next hash.
    // - depending on the flag, either another value for the "main queue" (merging branches) or an element from the
    //   `proof` array.
    bytes32 a;
    bytes32 b;
    for (uint256 i = 0; i < totalHashes; ) {
      a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
      b = BoolArray.atIndex(proofFlags, i)
        ? leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++]
        : proof[proofPos++];
      hashes[i] = _hashPair(a, b);

      unchecked {
        ++i;
      }
    }

    if (totalHashes > 0) {
      return hashes[totalHashes - 1];
    } else if (leavesLen > 0) {
      return leaves[0];
    } else {
      return proof[0];
    }
  }

  function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
    return a < b ? _efficientHash(a, b) : _efficientHash(b, a);
  }

  function _efficientHash(bytes32 a, bytes32 b)
    private
    pure
    returns (bytes32 value)
  {
    /// @solidity memory-safe-assembly
    assembly {
      mstore(0x00, a)
      mstore(0x20, b)
      value := keccak256(0x00, 0x40)
    }
  }
}
