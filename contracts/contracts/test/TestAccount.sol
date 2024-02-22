// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import '../Account.sol';

contract TestAccount is Account {
  function testExecuteTransaction(SystemTransaction calldata transaction) external {
    _executeSystemTransaction(transaction);
  }

  function getSchedule(bytes32 proposal) external view returns (uint32) {
    return Scheduler.getSchedule(proposal);
  }
}
