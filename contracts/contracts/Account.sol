// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IAccount} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {Transaction, TransactionHelper} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {ACCOUNT_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';
import {INonceHolder, NONCE_HOLDER_SYSTEM_CONTRACT, BOOTLOADER_FORMAL_ADDRESS} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

import {Initializable} from './Initializable.sol';
import {Upgradeable} from './Upgradeable.sol';
import {TransactionExecutor} from './TransactionExecutor.sol';
import {Rule, RuleKey} from './rule/Rule.sol';
import {RuleManager} from './rule/RuleManager.sol';
import {RuleValidator} from './rule/RuleValidator.sol';
import {ERC165} from './standards/ERC165.sol';
import {ERC721Receiver} from './standards/ERC721Receiver.sol';

contract Account is
  IAccount,
  Initializable,
  Upgradeable,
  TransactionExecutor,
  RuleManager,
  RuleValidator,
  ERC165,
  ERC721Receiver
{
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

  function initialize(Rule[] calldata rules) external initializer {
    uint256 rulesLen = rules.length;
    for (uint256 i; i < rulesLen; ) {
      _addRule(rules[i]);

      unchecked {
        ++i;
      }
    }
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
    _validateTransaction(_hashTx(transaction), transaction);
    return ACCOUNT_VALIDATION_SUCCESS_MAGIC;
  }

  /// @inheritdoc IAccount
  function executeTransaction(
    bytes32 /* _txHash */,
    bytes32 /* suggestedSignedHash */,
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    _executeTransaction(_hashTx(transaction), transaction);
  }

  /// @inheritdoc IAccount
  function executeTransactionFromOutside(
    Transaction calldata transaction
  ) external payable override {
    bytes32 txHash = _hashTx(transaction);
    _validateTransaction(txHash, transaction);
    _executeTransaction(txHash, transaction);
  }

  function _validateTransaction(bytes32 txHash, Transaction calldata transaction) internal {
    _revertIfExecuted(txHash);

    SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()),
      address(NONCE_HOLDER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (transaction.nonce))
    );

    if (TransactionHelper.totalRequiredBalance(transaction) > address(this).balance)
      revert InsufficientBalance();

    SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()),
      address(NONCE_HOLDER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (transaction.nonce))
    );

    (Rule memory rule, bytes[] memory signatures) = abi.decode(
      transaction.signature,
      (Rule, bytes[])
    );
    _validateRule(rule, transaction, txHash, signatures);
  }

  /*//////////////////////////////////////////////////////////////
                                PAYMASTER
  //////////////////////////////////////////////////////////////*/

  function payForTransaction(
    bytes32, // txHash
    bytes32, // suggestedSignedHash
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    bool success = TransactionHelper.payToTheBootloader(transaction);
    if (!success) revert FailedToPayBootloader();
  }

  function prepareForPaymaster(
    bytes32, // txHash
    bytes32, // suggestedSignedHash
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    TransactionHelper.processPaymasterInput(transaction);
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
