// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {PolicyManager} from 'src/validation/PolicyManager.sol';
import {Policy, PolicyLib, PolicyKey} from 'src/validation/Policy.sol';
import {SelfOwned} from 'src/helpers/SelfOwned.sol';

contract PolicyManagerTest is UnitTest, PolicyManager {
  /*//////////////////////////////////////////////////////////////
                               ADD POLICY
  //////////////////////////////////////////////////////////////*/

  function testFuzz_addPolicy_SelfCalled_ThresholdLteApprovers_SetPolicyHash(
    Policy memory p
  ) public {
    vm.assume(p.threshold <= p.approvers.length);
    vm.assume(p.hooks.length == 0);

    this.addPolicy(p);
    assertEq(PolicyLib.hashes()[p.key], PolicyLib.hash(p));
  }

  function testFuzz_addPolicy_SelfCalled_ThresholdLteApprovers_EmitEvent(Policy memory p) public {
    vm.assume(p.threshold <= p.approvers.length);
    vm.assume(p.hooks.length == 0);

    vm.expectEmit(true, true, true, true);
    emit PolicyManager.PolicyAdded(p.key, PolicyLib.hash(p));

    this.addPolicy(p);
  }

  function testFuzz_addPolicy_SelfCalled_RevertWhen_ThresholdGtApprovers(Policy memory p) public {
    vm.assume(p.threshold > p.approvers.length);
    vm.assume(p.hooks.length == 0);

    vm.expectRevert(
      abi.encodeWithSelector(PolicyManager.ThresholdTooHigh.selector, p.approvers.length)
    );
    this.addPolicy(p);
  }

  function testFuzz_addPolicy_RevertWhen_CalledByOther(address caller, Policy memory p) public {
    vm.assume(caller != address(this));
    vm.assume(p.hooks.length == 0);
    vm.prank(caller);

    vm.expectRevert(SelfOwned.OnlyCallableBySelf.selector);
    this.addPolicy(p);
  }

  /*//////////////////////////////////////////////////////////////
                             REMOVE POLICY
  //////////////////////////////////////////////////////////////*/

  function test_removePolicy_SelfCalled_ZeroHash(PolicyKey key, bytes32 existingHash) public {
    PolicyLib.hashes()[key] = existingHash;

    this.removePolicy(key);
    assertEq(PolicyLib.hashes()[key], bytes32(0));
  }

  function test_removePolicy_SelfCalled_EmitEvent(PolicyKey key, bytes32 existingHash) public {
    PolicyLib.hashes()[key] = existingHash;

    vm.expectEmit(true, true, true, true);
    emit PolicyManager.PolicyRemoved(key);

    this.removePolicy(key);
  }

  function testFuzz_removePolicy_RevertWhen_CalledByOther(address caller, Policy memory p) public {
    vm.assume(caller != address(this));
    vm.assume(p.hooks.length == 0);
    vm.prank(caller);

    vm.expectRevert(SelfOwned.OnlyCallableBySelf.selector);
    this.addPolicy(p);
  }
}
