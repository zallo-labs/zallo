// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {Scheduler} from 'src/execution/Scheduler.sol';

contract SchedulerTest is UnitTest {
  /*//////////////////////////////////////////////////////////////
                                SCHEDULE
  //////////////////////////////////////////////////////////////*/

  function testFuzz_schedue_NonZero_SetScheduleTimestamp(
    bytes32 proposal,
    uint64 timestamp
  ) public {
    vm.assume(timestamp != 0);

    Scheduler.schedule(proposal, timestamp);

    assertEq(Scheduler.getSchedule(proposal).timestamp, timestamp);
  }

  function testFuzz_schedue_NonZero_EmitEvent(bytes32 proposal, uint64 timestamp) public {
    vm.assume(timestamp != 0);

    vm.expectEmit(true, true, true, true);
    emit Scheduler.Scheduled(proposal, timestamp);

    Scheduler.schedule(proposal, timestamp);
  }

  function testFuzz_schedue_RevertWhen_Zero(bytes32 proposal) public {
    vm.expectRevert(abi.encodeWithSelector(Scheduler.ZeroScheduleTimestamp.selector, proposal));

    Scheduler.schedule(proposal, 0);
  }

  /*//////////////////////////////////////////////////////////////
                                VALIDATE
  //////////////////////////////////////////////////////////////*/

  function test_validate_Scheduled_SetUsed(bytes32 proposal, uint64 timestamp) public {
    vm.assume(timestamp != 0);

    Scheduler.schedule(proposal, timestamp);
    Scheduler.validate(proposal);

    assertTrue(Scheduler.getSchedule(proposal).used);
  }

  function test_validate_RevertWhen_NotScheduled(bytes32 proposal) public {
    vm.expectRevert(abi.encodeWithSelector(Scheduler.NotScheduled.selector, proposal));

    Scheduler.validate(proposal);
  }

  function test_validate_RevertWhen_AlreadyExecuted(bytes32 proposal, uint64 timestamp) public {
    vm.assume(timestamp != 0);

    Scheduler.schedule(proposal, timestamp);
    Scheduler.validate(proposal);

    vm.expectRevert(abi.encodeWithSelector(Scheduler.AlreadyExecuted.selector, proposal));
    Scheduler.validate(proposal);
  }

  /*//////////////////////////////////////////////////////////////
                              SET EXECUTED
  //////////////////////////////////////////////////////////////*/

  function test_setExecuted_AtOrPastSchedule(
    bytes32 proposal,
    uint64 scheduledForTimestamp,
    uint64 blockTimestamp
  ) public {
    vm.assume(scheduledForTimestamp != 0 && blockTimestamp >= scheduledForTimestamp);

    vm.warp(blockTimestamp);
    Scheduler.schedule(proposal, scheduledForTimestamp);
    Scheduler.setExecuted(proposal);

    // Deletes schedule
    assertEq(Scheduler.getSchedule(proposal).timestamp, 0);
    assertEq(Scheduler.getSchedule(proposal).used, false);
  }

  function test_setExecuted_RevertWhen_NotYetScheduled(
    bytes32 proposal,
    uint64 scheduledForTimestamp,
    uint64 blockTimestamp
  ) public {
    vm.assume(scheduledForTimestamp != 0 && blockTimestamp < scheduledForTimestamp);

    vm.warp(blockTimestamp);
    Scheduler.schedule(proposal, scheduledForTimestamp);

    vm.expectRevert(
      abi.encodeWithSelector(Scheduler.NotScheduledYet.selector, proposal, scheduledForTimestamp)
    );

    Scheduler.setExecuted(proposal);
  }

  function test_setExecuted_RevertWhen_NotScheduled(bytes32 proposal) public {
    vm.expectRevert(abi.encodeWithSelector(Scheduler.NotScheduled.selector, proposal));

    Scheduler.setExecuted(proposal);
  }

  /*//////////////////////////////////////////////////////////////
                                 CANCEL
  //////////////////////////////////////////////////////////////*/

  function test_cancel_DeleteSchedule(bytes32 proposal, uint64 timestamp) public {
    vm.assume(timestamp != 0);
    Scheduler.schedule(proposal, timestamp);

    Scheduler.cancel(proposal);

    assertEq(Scheduler.getSchedule(proposal).timestamp, 0);
    assertEq(Scheduler.getSchedule(proposal).used, false);
  }

  function test_cancel_EmitEvent(bytes32 proposal, uint64 timestamp) public {
    vm.assume(timestamp != 0);
    Scheduler.schedule(proposal, timestamp);

    vm.expectEmit(true, true, true, true);
    emit Scheduler.ScheduleCancelled(proposal);

    Scheduler.cancel(proposal);
  }
}
