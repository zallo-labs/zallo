// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {Upgradeable} from 'src/core/Upgradeable.sol';
import {SelfOwned} from 'src/core/SelfOwned.sol';

contract UpgradeableTest is UnitTest, Upgradeable {
  /*//////////////////////////////////////////////////////////////
                           AUTHORIZE UPGRADE
  //////////////////////////////////////////////////////////////*/

  // TODO: re-enable when vm.prank works
  // function testFuzz_authorizeUpgrade_CalledBySelf(address newImplementation) public {
  //   vm.startPrank(address(this));

  //   _authorizeUpgrade(newImplementation);
  // }

  function testFuzz_authorizeUpgrade_RevertWhen_CalledByOther(
    address caller,
    address newImplementation
  ) public {
    vm.assume(caller != address(this));
    vm.startPrank(caller);

    vm.expectRevert(SelfOwned.OnlyCallableBySelf.selector);
    _authorizeUpgrade(newImplementation);
  }
}
