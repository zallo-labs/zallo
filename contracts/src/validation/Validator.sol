// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';
import {INonceHolder, NONCE_HOLDER_SYSTEM_CONTRACT} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

import {Policy} from './Policy.sol';
import {Approvals, ApprovalsLib} from './Approvals.sol';
import {Hook, Hooks} from './hooks/Hooks.sol';
import {SystemTransaction, TransactionUtil, Tx, TxType} from '~/execution/Transaction.sol';
import {Executor} from '~/execution/Executor.sol';
import {Scheduler} from '~/execution/Scheduler.sol';

library Validator {
  using TransactionUtil for SystemTransaction;
  using TransactionUtil for Tx;
  using Hooks for Hook[];
  using ApprovalsLib for Approvals;

  function validateSystemTransaction(
    SystemTransaction calldata systx
  ) internal returns (bool success) {
    _incrementNonceIfEquals(systx);

    bool valid;
    TxType txType = systx.transactionType();
    if (txType == TxType.Standard) {
      valid = _validateTransaction(systx);
    } else if (txType == TxType.Scheduled) {
      valid = _validateScheduledTransaction(systx);
    } else {
      revert TransactionUtil.UnexpectedTransactionType(txType);
    }

    return valid && !systx.isGasEstimation();
  }

  function _validateTransaction(SystemTransaction calldata systx) private returns (bool success) {
    Tx memory transaction = systx.transaction();
    bytes32 proposal = transaction.hash();
    (Policy memory policy, Approvals memory approvals) = systx.policyAndApprovals();

    Executor.consume(proposal);
    policy.hooks.validateOperations(transaction.operations);

    success = approvals.verify(proposal, policy);
  }

  function _validateScheduledTransaction(
    SystemTransaction calldata systx
  ) private returns (bool success) {
    Tx memory transaction = abi.decode(systx.data, (Tx));
    Scheduler.consume(transaction.hash());
    success = true;
  }

  function _incrementNonceIfEquals(SystemTransaction calldata systx) private {
    SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()), // safe truncation
      address(NONCE_HOLDER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (systx.nonce))
    );
  }
}
