// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {Operation} from '../../libraries/TransactionUtil.sol';
import {TargetHook} from './TargetHook.sol';
import {TransferHook} from './TransferHook.sol';
import {DelayHook} from './DelayHook.sol';
import {OtherMessageHook} from './OtherMessageHook.sol';

struct Hook {
  uint8 selector;
  bytes config;
}

// Transaction hooks [0x00, 0x7f]
uint8 constant TARGET_HOOK = 0x10;
uint8 constant TRANSFER_HOOK = 0x11;
uint8 constant DELAY_HOOK = 0x7f;

// Message hooks [0x80, 0xff]
uint8 constant OTHER_MESSAGE_HOOK = 0xff;

library Hooks {
  error HooksOutOfOrder();

  function checkConfigs(Hook[] memory hooks) internal pure {
    uint8 lastSelector /* = 0 */;
    uint8 selector;
    for (uint256 i; i < hooks.length; ++i) {
      selector = hooks[i].selector;

      // Hooks must be sorted ascending by selector, ensuring order of execution
      if (selector < lastSelector) revert HooksOutOfOrder();
      lastSelector = selector;

      if (selector == TARGET_HOOK) {
        TargetHook.checkConfig(hooks[i].config);
      } else if (selector == TRANSFER_HOOK) {
        TransferHook.checkConfig(hooks[i].config);
      }
    }
  }

  function replaceSelfAddress(Hook[] memory hooks) internal view returns (Hook[] memory) {
    uint8 selector;
    uint256 len = hooks.length;
    for (uint256 i; i < len; ++i) {
      selector = hooks[i].selector;

      if (selector == TARGET_HOOK) {
        hooks[i].config = TargetHook.replaceSelfAddress(hooks[i].config);
      }
    }

    return hooks;
  }

  /*//////////////////////////////////////////////////////////////
                              TRANSACTION
  //////////////////////////////////////////////////////////////*/

  function validateOperations(Hook[] memory hooks, Operation[] memory operations) internal pure {
    uint8 selector;
    for (uint256 i; i < hooks.length; ++i) {
      selector = hooks[i].selector;

      if (selector == TARGET_HOOK) {
        TargetHook.validateOperations(operations, hooks[i].config);
      }
    }
  }

  function beforeExecute(
    Hook[] memory hooks,
    bytes32 proposal,
    Operation[] memory operations
  ) internal returns (bool execute) {
    execute = true;
    uint8 selector;
    for (uint256 i; i < hooks.length; ++i) {
      selector = hooks[i].selector;

      if (selector == TRANSFER_HOOK) {
        TransferHook.beforeExecute(operations, hooks[i].config);
      } else if (selector == DELAY_HOOK) {
        execute = DelayHook.beforeExecute(proposal, hooks[i].config);
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                                MESSAGE
  //////////////////////////////////////////////////////////////*/

  function validateMessage(Hook[] memory hooks, bytes memory message) internal pure {
    bool handled /* = false */;
    uint8 selector;
    for (uint256 i; i < hooks.length; ++i) {
      selector = hooks[i].selector;

      if (selector == OTHER_MESSAGE_HOOK) {
        handled = OtherMessageHook.validateMessage(hooks[i].config, handled) || handled;
      }
    }
  }
}
