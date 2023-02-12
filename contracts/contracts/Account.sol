// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';
import {ACCOUNT_VALIDATION_SUCCESS_MAGIC} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol';

import './IAccount.sol';
import './SelfOwned.sol';
import './Initializable.sol';
import {Upgradeable} from './Upgradeable.sol';
import './TransactionExecutor.sol';
import './ERC165.sol';
import './ERC721Receiver.sol';
import {SignatureChecker} from './utils/SignatureChecker.sol';

contract Account is
  IAccount,
  SelfOwned,
  Initializable,
  Upgradeable,
  TransactionExecutor,
  ERC165,
  ERC721Receiver
{
  using SignatureChecker for address;
  using QuorumHelper for Quorum;

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor() {
    // Disable initializing the implementation contract; avoiding any potential nonsense (e.g. selfdestruct)
    _disableInitializers();
  }

  function initialize(QuorumDefinition[] calldata quorums) external initializer {
    uint256 quorumsLen = quorums.length;
    for (uint256 i; i < quorumsLen; ) {
      _upsertQuorum(quorums[i].key, quorums[i].hash);

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

  /// @inheritdoc BaseIAccount
  function validateTransaction(
    bytes32 /* _txHash */,
    bytes32 /* suggestedSignedHash */,
    Transaction calldata transaction
  ) external payable override onlyBootloader returns (bytes4 magic) {
    _validateTransaction(_hashTx(transaction), transaction);
    return ACCOUNT_VALIDATION_SUCCESS_MAGIC;
  }

  /// @inheritdoc BaseIAccount
  function executeTransaction(
    bytes32 /* _txHash */,
    bytes32 /* suggestedSignedHash */,
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    _executeTransaction(_hashTx(transaction), transaction);
  }

  /// @inheritdoc BaseIAccount
  function executeTransactionFromOutside(
    Transaction calldata transaction
  ) external payable override {
    bytes32 txHash = _hashTx(transaction);
    _validateTransaction(txHash, transaction);
    _executeTransaction(txHash, transaction);
  }

  function _validateTransaction(bytes32 txHash, Transaction calldata transaction) internal {
    SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()),
      address(NONCE_HOLDER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (transaction.nonce))
    );

    if (hasBeenExecuted(txHash)) revert TransactionAlreadyExecuted();

    _validateSignature(txHash, transaction.signature);
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
    require(success, 'Failed to pay the fee to the operator');
  }

  function prepareForPaymaster(
    bytes32, // txHash
    bytes32, // suggestedSignedHash
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    TransactionHelper.processPaymasterInput(transaction);
  }

  /*//////////////////////////////////////////////////////////////
                            QUORUM MANAGEMENT
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc IAccount
  function upsertQuorum(QuorumKey key, bytes32 hash) external payable onlySelf {
    _upsertQuorum(key, hash);
  }

  /// @inheritdoc IAccount
  function removeQuorum(QuorumKey key) external payable onlySelf {
    delete _quorums()[key];
    emit QuorumRemoved(key);
  }

  function _upsertQuorum(QuorumKey key, bytes32 hash) internal {
    _quorums()[key] = hash;
    emit QuorumUpserted(key, hash);
  }

  /*//////////////////////////////////////////////////////////////
                          SIGNATURE VALIDATION
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc IERC1271
  function isValidSignature(
    bytes32 hash,
    bytes memory signature
  ) external view override returns (bytes4) {
    _validateSignature(hash, signature);
    return EIP1271_SUCCESS;
  }

  function _validateSignature(bytes32 hash, bytes memory signature) internal view {
    (QuorumKey key, Quorum memory quorum, bytes[] memory signatures) = abi.decode(
      signature,
      (QuorumKey, Quorum, bytes[])
    );

    bytes32 expectedQuorumHash = _quorums()[key];
    if (quorum.hash() != expectedQuorumHash) revert QuorumHashMismatch(expectedQuorumHash);

    _validateSignatures(hash, quorum.approvers, signatures);
  }

  function _validateSignatures(
    bytes32 hash,
    address[] memory approvers,
    bytes[] memory signatures
  ) internal view {
    uint256 approversLength = approvers.length;
    if (approversLength != signatures.length) revert ApproverSignaturesMismatch();

    for (uint256 i; i < approversLength; ) {
      if (!approvers[i].isValidSignatureNow(hash, signatures[i]))
        revert InvalidSignature(approvers[i]);

      unchecked {
        ++i;
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                          QUORUM MERKLE ROOTS
    //////////////////////////////////////////////////////////////*/

  function _quorums() internal pure returns (mapping(QuorumKey => bytes32) storage s) {
    assembly {
      // keccack256('Account.quorums')
      s.slot := 0x37960d0a655d0d781716b0e17600d3e44caa3d99659d8fb953b4c370d154d1a4
    }
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyCallableByBootloader();
    _;
  }
}
