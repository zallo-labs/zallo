// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Policy, PermissionSelector, Permission} from './Policy.sol';
import {TargetPermission, Target} from './permissions/TargetPermission.sol';

library TransactionVerifier {
  error UnknownPermission(PermissionSelector selector);

  function verifyPermissions(
    Transaction memory transaction,
    Permission[] memory permissions
  ) internal pure {
    Permission memory rule;
    uint256 permissionsLen = permissions.length;
    for (uint256 i; i < permissionsLen; ) {
      rule = permissions[i];

      if (rule.selector == PermissionSelector.Target) {
        TargetPermission.verify(transaction, abi.decode(rule.args, (Target[])));
      } else {
        revert UnknownPermission(rule.selector);
      }

      unchecked {
        ++i;
      }
    }
  }
}
