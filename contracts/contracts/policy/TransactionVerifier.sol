// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {TransactionUtil, Operation} from '../TransactionUtil.sol';
import {Policy, PermissionSelector, Permission} from './Policy.sol';
import {TargetPermission, Target} from './permissions/TargetPermission.sol';

library TransactionVerifier {
  using TransactionUtil for Transaction;

  error UnknownPermission(PermissionSelector selector);

  function verifyPermissions(
    Transaction calldata transaction,
    Permission[] memory permissions
  ) internal view {
    Operation[] memory operations = transaction.operations();
    uint256 operationsLen = operations.length;

    Permission memory permission;
    uint256 permissionsLen = permissions.length;
    for (uint256 permissionIndex; permissionIndex < permissionsLen; ++permissionIndex) {
      permission = permissions[permissionIndex];

      for (uint256 opIndex; opIndex < operationsLen; ++opIndex) {
        if (permission.selector == PermissionSelector.Target) {
          TargetPermission.verify(operations[opIndex], abi.decode(permission.args, (Target[])));
        } else {
          revert UnknownPermission(permission.selector);
        }
      }
    }
  }
}
