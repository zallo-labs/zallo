// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {Initializable} from 'src/core/Initializable.sol';

contract InitializableTest is UnitTest, Initializable {
  /*//////////////////////////////////////////////////////////////
                              INITIALIZER
  //////////////////////////////////////////////////////////////*/

  function test_initializer_CalledOnce() public {
    _initialize();
  }

  function test_initializer_RevertWhen_CalledTwice() public {
    _initialize();

    vm.expectRevert(Initializable.AlreadyInitialized.selector);
    _initialize();
  }

  /*//////////////////////////////////////////////////////////////
                          DISABLE INITIALIZERS
  //////////////////////////////////////////////////////////////*/

  function test_disableInitizers_RevertWhen_InitializerCalled() public {
    _disableInitializers();

    vm.expectRevert(Initializable.AlreadyInitialized.selector);
    _initialize();
  }

  /*//////////////////////////////////////////////////////////////
                                 UTILS
  //////////////////////////////////////////////////////////////*/

  function _initialize() internal initializer {} // solhint-disable-line no-empty-blocks
}
