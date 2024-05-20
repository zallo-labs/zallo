// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';
import {INonceHolder, NONCE_HOLDER_SYSTEM_CONTRACT} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

import {Policy} from './Policy.sol';
import {Approvals, ApprovalsLib} from './Approvals.sol';
import {Hook, Hooks} from './hooks/Hooks.sol';
import {SystemTransaction, TransactionLib, Tx, TxType} from 'src/execution/Transaction.sol';
import {Scheduler} from 'src/execution/Scheduler.sol';

library Validator {
  using TransactionLib for SystemTransaction;
  using TransactionLib for Tx;
  using Hooks for Hook[];
  using ApprovalsLib for Approvals;

  error UnexpectedTransactionType(TxType txType);
  error AlreadyExecuted(bytes32 proposal);

  /// @dev Separate from validateAfterIncrementingNonce as incrementing nonce throws `InvalidOperandOOG` when tested
  function validate(SystemTransaction calldata systx) internal returns (bool success) {
    _incrementNonceIfEquals(systx);

    return validateAfterIncrementingNonce(systx);
  }

  function validateAfterIncrementingNonce(
    SystemTransaction calldata systx
  ) internal returns (bool success) {
    bool valid /* = false */;
    TxType txType = systx.transactionType();
    if (txType == TxType.Standard) {
      valid = _validateTransaction(systx);
    } else if (txType == TxType.Scheduled) {
      valid = _validateScheduledTransaction(systx);
    } else {
      revert UnexpectedTransactionType(txType);
    }

    return valid && !systx.isGasEstimation();
  }

  // TODO: transaction.hashStore() instead when cancun is supported
  function _validateTransaction(SystemTransaction calldata systx) private returns (bool success) {
    Tx memory transaction = systx.transaction();
    bytes32 proposal = transaction.hash();
    (Policy memory policy, Approvals memory approvals) = systx.policyAndApprovals();

    _consumeTransaction(proposal);
    policy.hooks.validateOperations(transaction.operations);

    success = approvals.verify(proposal, policy);
  }

  // TODO: transaction.hashStore() instead when cancun is supported
  function _validateScheduledTransaction(
    SystemTransaction calldata systx
  ) private returns (bool success) {
    Tx memory transaction = abi.decode(systx.data, (Tx));

    Scheduler.validate(transaction.hash());

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

  /*//////////////////////////////////////////////////////////////
                         EXECUTED TRANSACTIONS
  //////////////////////////////////////////////////////////////*/

  function _executedTransactions() private pure returns (mapping(uint256 => uint256) storage s) {
    assembly ('memory-safe') {
      // keccack256('Validator.executedTransactions')
      s.slot := 0x23d07622c9c4a8f93e2379f065adecb064982810ba92f0c43553e32204698aff
    }
  }

  function _consumeTransaction(bytes32 proposal) internal {
    uint256 word = uint256(proposal) / 256;
    uint256 bit = uint256(proposal) % 256;
    uint256 mask = 1 << bit;

    if (_executedTransactions()[word] & mask == mask) revert AlreadyExecuted(proposal);

    _executedTransactions()[word] |= mask;
  }
}
