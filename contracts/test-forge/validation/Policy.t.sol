// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {Policy, PolicyLib, PolicyKey} from 'src/validation/Policy.sol';

contract PolicyTest is UnitTest {
  /*//////////////////////////////////////////////////////////////
                                 VERIFY
  //////////////////////////////////////////////////////////////*/

  function testFuzz_verify_PolicyAdded(Policy memory policy) public {
    PolicyLib.hashes()[policy.key] = PolicyLib.hash(policy);

    PolicyLib.verify(policy);
  }

  function testFuzz_verify_RevertWhen_PolicyNotAdded(Policy memory policy) public {
    vm.expectRevert(
      abi.encodeWithSelector(
        PolicyLib.PolicyDoesNotMatchExpectedHash.selector,
        PolicyLib.hash(policy),
        bytes32(0)
      )
    );

    PolicyLib.verify(policy);
  }
}
