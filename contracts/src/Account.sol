// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {IAccount} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {TransactionHelper as SystemTransactionHelper} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {ACCOUNT_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

import {SelfOwned} from './core/SelfOwned.sol';
import {Initializable} from './core/Initializable.sol';
import {Upgradeable} from './core/Upgradeable.sol';
import {TokenReceiver} from './core/TokenReceiver.sol';
import {Validator} from './validation/Validator.sol';
import {Policy} from './validation/Policy.sol';
import {PolicyManager} from './validation/PolicyManager.sol';
import {MessageValidator} from './validation/MessageValidator.sol';
import {SystemTransaction} from './execution/Transaction.sol';
import {Executor} from './execution/Executor.sol';
import {Scheduler} from './execution/Scheduler.sol';
import {PaymasterFlow} from './paymaster/PaymasterFlow.sol';

/*

 ███████╗ █████╗ ██╗     ██╗      ██████╗                     
 ╚══███╔╝██╔══██╗██║     ██║     ██╔═══██╗                    
   ███╔╝ ███████║██║     ██║     ██║   ██║                    
  ███╔╝  ██╔══██║██║     ██║     ██║   ██║                    
 ███████╗██║  ██║███████╗███████╗╚██████╔╝                    
 ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝                     
                                                              
  █████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗███╗   ██╗████████╗
 ██╔══██╗██╔════╝██╔════╝██╔═══██╗██║   ██║████╗  ██║╚══██╔══╝
 ███████║██║     ██║     ██║   ██║██║   ██║██╔██╗ ██║   ██║   
 ██╔══██║██║     ██║     ██║   ██║██║   ██║██║╚██╗██║   ██║   
 ██║  ██║╚██████╗╚██████╗╚██████╔╝╚██████╔╝██║ ╚████║   ██║   
 ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   
 
*/

contract Account is
  IAccount,
  SelfOwned,
  Initializable,
  Upgradeable,
  PolicyManager,
  MessageValidator,
  TokenReceiver
{
  /*//////////////////////////////////////////////////////////////
                                 ERRORS
  //////////////////////////////////////////////////////////////*/

  error FailedToValidate();
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
    if (Validator.validate(systx)) magic = ACCOUNT_VALIDATION_SUCCESS_MAGIC;
  }

  /// @inheritdoc IAccount
  function executeTransaction(
    bytes32 /* txHash */,
    bytes32 /* suggestedSignedHash */,
    SystemTransaction calldata systx
  ) external payable override onlyBootloader {
    Executor.execute(systx);
  }

  /// @inheritdoc IAccount
  function executeTransactionFromOutside(
    SystemTransaction calldata systx
  ) external payable override {
    if (!Validator.validate(systx)) revert FailedToValidate();

    Executor.execute(systx);
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
    PaymasterFlow.payPaymaster(systx);
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
