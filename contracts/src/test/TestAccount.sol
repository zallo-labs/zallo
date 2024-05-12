// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import '../Account.sol';
import {Executor} from 'src/execution/Executor.sol';

contract TestAccount is Account {
  function testExecuteTransaction(SystemTransaction calldata systx) external {
    Executor.execute(systx);
  }

  function getSchedule(bytes32 proposal) external view returns (uint64) {
    return Scheduler.getSchedule(proposal).timestamp;
  }
}
