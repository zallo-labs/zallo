// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Policy, PolicyKey, Permission} from '../policy/Policy.sol';
import {TransactionVerifier} from '../policy/TransactionVerifier.sol';
import {Approvals, ApprovalsVerifier} from '../policy/ApprovalsVerifier.sol';
import {TransactionUtil, Operation} from '../TransactionUtil.sol';
import {TargetPermission, Target} from '../policy/permissions/TargetPermission.sol';

contract TestVerifier {
  using TransactionUtil for Transaction;
  using TransactionVerifier for Transaction;
  using ApprovalsVerifier for Approvals;

  function verifyTransactionPermissions(
    Transaction calldata transaction,
    Permission[] calldata permissions
  ) external view {
    transaction.verifyPermissions(permissions);
  }

  function verifyApprovals(
    Approvals calldata approvals,
    bytes32 hash,
    Policy calldata policy
  ) external view {
    approvals.verify(hash, policy);
  }

  function verifyTransactionPermissionsAndApprovals(
    Transaction calldata transaction,
    Policy calldata policy,
    Approvals calldata approvals
  ) external view {
    transaction.verifyPermissions(policy.permissions);
    approvals.verify(transaction.hash(), policy);
  }

  /*//////////////////////////////////////////////////////////////
                              PERMISSIONS
  //////////////////////////////////////////////////////////////*/

  function verifyTargetPermission(
    Operation calldata operation,
    Target[] calldata targets
  ) external pure {
    TargetPermission.verify(operation, targets);
  }
}
