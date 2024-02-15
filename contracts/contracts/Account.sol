// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IAccount} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {Transaction as SystemTransaction, TransactionHelper as SystemTransactionHelper} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {ACCOUNT_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {IContractDeployer, DEPLOYER_SYSTEM_CONTRACT, BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

import {Initializable} from './Initializable.sol';
import {Upgradeable} from './Upgradeable.sol';
import {Policy, PolicyKey} from './policy/Policy.sol';
import {PolicyManager} from './policy/PolicyManager.sol';
import {Approvals, ApprovalsVerifier} from './policy/ApprovalsVerifier.sol';
import {Hook, Hooks} from './policy/hooks/Hooks.sol';
import {Executor} from './Executor.sol';
import {ERC165} from './standards/ERC165.sol';
import {ERC721Receiver} from './standards/ERC721Receiver.sol';
import {SignatureValidator} from './base/SignatureValidator.sol';
import {TransactionUtil, Tx} from './libraries/TransactionUtil.sol';
import {PaymasterUtil} from './paymaster/PaymasterUtil.sol';

contract Account is
  IAccount,
  Initializable,
  Upgradeable,
  PolicyManager,
  Executor,
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

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor() {
    // Disable initializing the implementation contract; avoiding any potential nonsense (e.g. selfdestruct)
    _disableInitializers();
  }

  function initialize(Policy[] calldata policies) external initializer {
    // _initializeArbitraryNonceOrdering();
    _initializeWithPolicies(policies);
  }

  /*//////////////////////////////////////////////////////////////
                                FALLBACK
  //////////////////////////////////////////////////////////////*/

  receive() external payable {}

  fallback() external payable {}

  /*//////////////////////////////////////////////////////////////
                          systx HANDLING
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc IAccount
  function validateTransaction(
    bytes32 /* _txHash */,
    bytes32 /* suggestedSignedHash */,
    SystemTransaction calldata systx
  ) external payable override onlyBootloader returns (bytes4 magic) {
    return _validateTransaction(systx);
  }

  /**
   * @notice Validates systx and returns magic value if successful
   * @return magic ACCOUNT_VALIDATION_SUCCESS_MAGIC on success, and bytes(0) when approval is insufficient
   * @dev Reverts with errors when non-approval related validation fails
   * @param systx SystemTransaction
   */
  function _validateTransaction(
    SystemTransaction calldata systx
  ) internal returns (bytes4 magic) {
    Tx memory transaction = systx.asTx();
    bytes32 proposal = transaction.hash();

    _incrementNonceIfEquals(systx);
    _validateTransactionUnexecuted(proposal);

    (Policy memory policy, Approvals memory approvals) = systx.policyAndApprovals();
    policy.hooks.validateOperations(transaction.operations);

    bool isApproved = approvals.verify(proposal, policy);
    bool notGasEstimation = !systx.isGasEstimation();
    if (isApproved && notGasEstimation) magic = ACCOUNT_VALIDATION_SUCCESS_MAGIC;
  }

  /// @inheritdoc IAccount
  function executeTransaction(
    bytes32 /* txHash */,
    bytes32 /* suggestedSignedHash */,
    SystemTransaction calldata systx
  ) external payable override onlyBootloader {
    _executeTransaction(systx);
  }

  function _executeTransaction(SystemTransaction calldata systx) internal {
    Tx memory transaction = systx.asTx();
    _executeOperations(transaction.hash(), transaction.operations, systx.policy().hooks);
  }

  /// @inheritdoc IAccount
  function executeTransactionFromOutside(
    SystemTransaction calldata systx
  ) external payable override {
    if (_validateTransaction(systx) != ACCOUNT_VALIDATION_SUCCESS_MAGIC)
      revert InsufficientApproval();

    _executeTransaction(systx);
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
