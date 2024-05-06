// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IAccount} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {Transaction as SystemTransaction, TransactionHelper as SystemTransactionHelper} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {ACCOUNT_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {INonceHolder, BOOTLOADER_FORMAL_ADDRESS, NONCE_HOLDER_SYSTEM_CONTRACT} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

import {Initializable} from './core/Initializable.sol';
import {Upgradeable} from './core/Upgradeable.sol';
import {Validator} from './validation/Validator.sol';
import {Policy} from './validation/Policy.sol';
import {PolicyManager} from './validation/PolicyManager.sol';
import {Approvals, ApprovalsVerifier} from './validation/ApprovalsVerifier.sol';
import {Hook, Hooks} from './validation/hooks/Hooks.sol';
import {MessageValidator} from './validation/MessageValidator.sol';
import {TransactionUtil, Tx, TxType} from './execution/TransactionUtil.sol';
import {Executor} from './execution/Executor.sol';
import {Scheduler} from './execution/Scheduler.sol';
import {PaymasterUtil} from './paymaster/PaymasterUtil.sol';
import {TokenReceiver} from './core/TokenReceiver.sol';

contract Account is
  IAccount,
  Initializable,
  Upgradeable,
  PolicyManager,
  MessageValidator,
  TokenReceiver
{
  using SystemTransactionHelper for SystemTransaction;
  using TransactionUtil for SystemTransaction;
  using TransactionUtil for Tx;
  using Hooks for Hook[];
  using ApprovalsVerifier for Approvals;

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error FailedToValidate();
  error InsufficientBalance();
  error FailedToPayBootloader();
  error OnlyCallableByBootloader();

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
    if (Validator.validateSystemTransaction(systx)) magic = ACCOUNT_VALIDATION_SUCCESS_MAGIC;
  }

  /// @inheritdoc IAccount
  function executeTransaction(
    bytes32 /* txHash */,
    bytes32 /* suggestedSignedHash */,
    SystemTransaction calldata systx
  ) external payable override onlyBootloader {
    Executor.executeValidatedSystemTransaction(systx);
  }

  /// @inheritdoc IAccount
  function executeTransactionFromOutside(
    SystemTransaction calldata systx
  ) external payable override {
    if (!Validator.validateSystemTransaction(systx)) revert FailedToValidate();

    Executor.executeValidatedSystemTransaction(systx);
  }

  function cancelScheduledTransaction(bytes32 proposal) external payable onlySelf {
    Scheduler.cancel(proposal);
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
