// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {IAccount} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {Transaction as SystemTransaction, TransactionHelper as SystemTransactionHelper} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {ACCOUNT_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {INonceHolder, BOOTLOADER_FORMAL_ADDRESS, NONCE_HOLDER_SYSTEM_CONTRACT} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

import {Initializable} from './Initializable.sol';
import {Upgradeable} from './Upgradeable.sol';
import {Policy, PolicyKey} from './policy/Policy.sol';
import {PolicyManager} from './policy/PolicyManager.sol';
import {Approvals, ApprovalsVerifier} from './policy/ApprovalsVerifier.sol';
import {Hook, Hooks} from './policy/hooks/Hooks.sol';
import {Executor} from './libraries/Executor.sol';
import {ERC165} from './standards/ERC165.sol';
import {ERC721Receiver} from './standards/ERC721Receiver.sol';
import {SignatureValidator} from './base/SignatureValidator.sol';
import {TransactionUtil, Tx, TxType} from './libraries/TransactionUtil.sol';
import {PaymasterUtil} from './paymaster/PaymasterUtil.sol';
import {Scheduler} from './libraries/Scheduler.sol';

contract Account is
  IAccount,
  Initializable,
  Upgradeable,
  PolicyManager,
  ERC165,
  ERC721Receiver,
  SignatureValidator
{
  using SystemTransactionHelper for SystemTransaction;
  using TransactionUtil for SystemTransaction;
  using TransactionUtil for Tx;
  using Hooks for Hook[];
  using ApprovalsVerifier for Approvals;

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error InsufficientApproval();
  error InsufficientBalance();
  error FailedToPayBootloader();
  error OnlyCallableByBootloader();
  error UnexpectedTransactionType(TxType txType);

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor() {
    // Disable initializing the implementation contract; avoiding any potential nonsense (e.g. selfdestruct)
    _disableInitializers();
  }

  function initialize(Policy[] calldata policies) external initializer {
    _initializeWithPolicies(policies);
  }

  /*//////////////////////////////////////////////////////////////
                                FALLBACK
  //////////////////////////////////////////////////////////////*/

  receive() external payable {}

  fallback() external payable {}

  /*//////////////////////////////////////////////////////////////
                          TRANSACTION HANDLING
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc IAccount
  function validateTransaction(
    bytes32 /* _txHash */,
    bytes32 /* suggestedSignedHash */,
    SystemTransaction calldata systx
  ) external payable override onlyBootloader returns (bytes4 magic) {
    if (_validateSystemTransaction(systx)) magic = ACCOUNT_VALIDATION_SUCCESS_MAGIC;
  }

  function _validateSystemTransaction(
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
      revert UnexpectedTransactionType(txType);
    }

    return valid && !systx.isGasEstimation();
  }

  function _validateTransaction(SystemTransaction calldata systx) internal returns (bool success) {
    Tx memory transaction = systx.transaction();
    bytes32 proposal = transaction.hash();
    (Policy memory policy, Approvals memory approvals) = systx.policyAndApprovals();

    Executor.consume(proposal);
    policy.hooks.validateOperations(transaction.operations);

    success = approvals.verify(proposal, policy);
  }

  function _validateScheduledTransaction(
    SystemTransaction calldata systx
  ) internal returns (bool success) {
    Tx memory transaction = abi.decode(systx.data, (Tx));
    Scheduler.consume(transaction.hash());
    success = true;
  }

  /// @inheritdoc IAccount
  function executeTransaction(
    bytes32 /* txHash */,
    bytes32 /* suggestedSignedHash */,
    SystemTransaction calldata systx
  ) external payable override onlyBootloader {
    _executeSystemTransaction(systx);
  }

  function _executeSystemTransaction(SystemTransaction calldata systx) internal {
    TxType txType = systx.transactionType();
    if (txType == TxType.Standard) {
      _executeTransaction(systx);
    } else if (txType == TxType.Scheduled) {
      _executeScheduledTransaction(systx);
    } else {
      revert UnexpectedTransactionType(txType);
    }
  }

  function _executeTransaction(SystemTransaction calldata systx) internal {
    Tx memory transaction = systx.transaction();
    Executor.executeOperations(transaction.hash(), transaction.operations, systx.policy().hooks);
  }

  function _executeScheduledTransaction(SystemTransaction calldata systx) internal {
    Tx memory transaction = abi.decode(systx.data, (Tx));
    Executor.executeOperations(transaction.hash(), transaction.operations, new Hook[](0));
  }

  /// @inheritdoc IAccount
  function executeTransactionFromOutside(
    SystemTransaction calldata systx
  ) external payable override {
    if (!_validateSystemTransaction(systx)) revert InsufficientApproval();

    _executeSystemTransaction(systx);
  }

  function cancelScheduledTransaction(bytes32 proposal) external payable onlySelf {
    Scheduler.cancel(proposal);
  }

  function _incrementNonceIfEquals(SystemTransaction calldata systx) private {
    SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()), // truncation ok
      address(NONCE_HOLDER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (systx.nonce))
    );
  }

  /*//////////////////////////////////////////////////////////////
                                PAYMASTER
  //////////////////////////////////////////////////////////////*/

  function payForTransaction(
    bytes32 /* txHash */,
    bytes32 /* txDataHash */,
    SystemTransaction calldata systx
  ) external payable override onlyBootloader {
    bool success = SystemTransactionHelper.payToTheBootloader(systx);
    if (!success) revert FailedToPayBootloader();
  }

  function prepareForPaymaster(
    bytes32 /* txHash */,
    bytes32 /* txDataHash */,
    SystemTransaction calldata systx
  ) external payable override onlyBootloader {
    PaymasterUtil.processPaymasterInput(systx);
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
