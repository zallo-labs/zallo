// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {UnitTest} from 'test/UnitTest.sol';
import {OtherMessageHook, OtherMessageConfig} from '~/validation/hooks/OtherMessageHook.sol';

contract OtherMessageHookTest is UnitTest {
  function testFuzz_validateMessage_PreviouslyHandled_NotHandle(bool allow) public pure {
    assertFalse(OtherMessageHook.validateMessage(_config(allow), true));
  }

  function test_validateMessage_Allowed_Handle() public pure {
    assertTrue(OtherMessageHook.validateMessage(_config(true), false));
  }

  function test_validateMessage_RevertWhen_NotAllowed() public {
    vm.expectRevert(OtherMessageHook.OtherMessageDenied.selector);
    OtherMessageHook.validateMessage(_config(false), false);
  }

  function _config(bool allow) internal pure returns (bytes memory configData) {
    return abi.encode(OtherMessageConfig({allow: allow}));
  }
}
