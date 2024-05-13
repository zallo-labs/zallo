// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {Hooks, Hook} from 'src/validation/hooks/Hooks.sol';

contract HooksTest is UnitTest {
  /*//////////////////////////////////////////////////////////////
                             CHECK CONFIGS
  //////////////////////////////////////////////////////////////*/

  function test_checkConfigs_UniqueAsc() public pure {
    Hook[] memory hooks = new Hook[](3);
    hooks[0].selector = 0x40;
    hooks[1].selector = 0xf0;
    hooks[2].selector = 0xf1;

    Hooks.checkConfigs(hooks);
  }

  function test_checkConfigs_RevertWhen_NotUnique() public {
    Hook[] memory hooks = new Hook[](2);
    hooks[0].selector = 0x40;
    hooks[1].selector = 0x40;

    vm.expectRevert(Hooks.HooksNotUniquelyAsc.selector);
    Hooks.checkConfigs(hooks);
  }

  function test_checkConfigs_RevertWhen_NotAsc() public {
    Hook[] memory hooks = new Hook[](2);
    hooks[0].selector = 0xf1;
    hooks[1].selector = 0xf0;

    vm.expectRevert(Hooks.HooksNotUniquelyAsc.selector);
    Hooks.checkConfigs(hooks);
  }
}
