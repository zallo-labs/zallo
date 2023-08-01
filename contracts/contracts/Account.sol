// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IAccount} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {Transaction, TransactionHelper} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
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
import {ERC1271Validator} from './standards/ERC1271Validator.sol';
import {TransactionUtil} from './TransactionUtil.sol';

contract Account is
  IAccount,
  Initializable,
  Upgradeable,
  PolicyManager,
  Executor,
  ERC165,
  ERC721Receiver,
  ERC1271Validator
{
  using TransactionHelper for Transaction;
  using TransactionUtil for Transaction;
  using Hooks for Hook[];
  using ApprovalsVerifier for Approvals;

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
    _addPolicies(policies);
    // _initializeArbitraryNonceOrdering();
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
    Transaction calldata transaction
  ) external payable override onlyBootloader returns (bytes4 magic) {
    return _validateTransaction(transaction.hash(), transaction);
  }

  /**
   * @notice Validates transaction and returns magic value if successful
   * @return magic ACCOUNT_VALIDATION_SUCCESS_MAGIC on success, and bytes(0) when approval is insufficient
   * @dev Reverts with errors when non-approval related validation fails
   * @param txHash Transaction hash - distinct from the suggested signed hash
   * @param transaction Transaction
   */
  function _validateTransaction(
    bytes32 txHash,
    Transaction calldata transaction
  ) internal returns (bytes4 magic) {
    _incrementNonceIfEquals(transaction);
    _validateTransactionUnexecuted(txHash);

    if (transaction.isGasEstimation()) return bytes4(0); // Gas estimation requires failure without reverting

    (Policy memory policy, Approvals memory approvals) = _decodeAndVerifySignature(
      transaction.signature
    );
    policy.hooks.validate(transaction.operations());

    if (!approvals.verify(txHash, policy)) return bytes4(0);

    return ACCOUNT_VALIDATION_SUCCESS_MAGIC;
  }

  /// @inheritdoc IAccount
  function executeTransaction(
    bytes32 /* _txHash */,
    bytes32 /* suggestedSignedHash */,
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    _executeTransaction(transaction.hash(), transaction);
  }

  /// @inheritdoc IAccount
  function executeTransactionFromOutside(
    Transaction calldata transaction
  ) external payable override {
    bytes32 txHash = transaction.hash();

    if (_validateTransaction(txHash, transaction) != ACCOUNT_VALIDATION_SUCCESS_MAGIC)
      revert InsufficientApproval();

    _executeTransaction(txHash, transaction);
  }

  /*//////////////////////////////////////////////////////////////
                                PAYMASTER
  //////////////////////////////////////////////////////////////*/

  function payForTransaction(
    bytes32, // txHash
    bytes32, // suggestedSignedHash
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    bool success = transaction.payToTheBootloader();
    if (!success) revert FailedToPayBootloader();
  }

  function prepareForPaymaster(
    bytes32, // txHash
    bytes32, // suggestedSignedHash
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    transaction.processPaymasterInput();
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
