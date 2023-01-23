// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '../Account.sol';

contract TestAccount is Account {
  function testExecuteTransaction(Transaction calldata transaction) external {
    _executeTransaction(_hashTx(transaction), transaction);
  }

  function getQuorumHash(QuorumKey key) external view returns (bytes32) {
    return _quorums()[key];
  }

  function hashTx(Transaction calldata transaction) external view returns (bytes32) {
    return _hashTx(transaction);
  }

  function domainSeparator() external view returns (bytes32) {
    return _domainSeparator();
  }
}
