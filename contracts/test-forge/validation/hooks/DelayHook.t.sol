// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {DelayHook, DelayConfig} from 'src/validation/hooks/DelayHook.sol';
import {Scheduler} from 'src/execution/Scheduler.sol';

contract DelayHookTest is UnitTest {
  /*//////////////////////////////////////////////////////////////
                             BEFORE EXECUTE
  //////////////////////////////////////////////////////////////*/

  bytes32 internal constant PROPOSAL = bytes32(uint256(1));

  function testFuzz_beforeExecute_DelayPositive_NotExecute(uint32 delay) public {
    vm.assume(delay > 0);

    assertFalse(DelayHook.beforeExecute(PROPOSAL, _config(delay)));
  }

  function testFuzz_beforeExecute_DelayPositive_ScheduleAfterDelay(uint32 delay) public {
    vm.assume(delay > 0);

    DelayHook.beforeExecute(PROPOSAL, _config(delay));

    assertEq(Scheduler.getSchedule(PROPOSAL), uint64(block.timestamp) + delay);
  }

  function test_beforeExecute_DelayZero_Execute() public {
    assertTrue(DelayHook.beforeExecute(PROPOSAL, _config(0)));
  }

  function _config(uint32 delay) internal pure returns (bytes memory configData) {
    return abi.encode(DelayConfig({delay: delay}));
  }
}
