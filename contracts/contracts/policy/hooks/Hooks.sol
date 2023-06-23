// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Operation} from '../../TransactionUtil.sol';
import {TargetHook} from '../hooks/TargetHook.sol';
import {TransferHook} from '../hooks/TransferHook.sol';

struct Hook {
  HookSelector selector;
  bytes config;
}

enum HookSelector {
  Target,
  Transfer
}

library Hooks {
  function validate(Hook[] memory hooks, Operation[] memory operations) internal view {
    HookSelector selector;
    for (uint256 i; i < hooks.length; ++i) {
      selector = hooks[i].selector;
      if (selector == HookSelector.Target) {
        TargetHook.validate(operations, hooks[i].config);
      }
    }
  }

  function beforeExecute(Hook[] memory hooks, Operation[] memory operations) internal {
    HookSelector selector;
    for (uint256 i; i < hooks.length; ++i) {
      selector = hooks[i].selector;
      if (selector == HookSelector.Transfer) {
        TransferHook.beforeExecute(operations, hooks[i].config);
      }
    }
  }
}
