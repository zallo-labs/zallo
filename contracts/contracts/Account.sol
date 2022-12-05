// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/TransactionHelper.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/SystemContractsCaller.sol';

import './IAccount.sol';
import './SelfOwned.sol';
import './Initializable.sol';
import './Upgradeable.sol';
import './TransactionExecutor.sol';
import './ERC165.sol';
import './ERC721Receiver.sol';
import {MerkleProof} from './utils/MerkleProof.sol';
import {BoolArray} from './utils/BoolArray.sol';
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
  using MerkleProof for bytes32[];
  using UserHelper for User;
  using UserConfigHelper for UserConfig;

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor() {
    // Disable initializing the implementation contract; avoiding any potential nonsense (e.g. selfdestruct)
    _disableInitializers();
  }

  function initialize(QuorumDef[] calldata quorums) external initializer {
    uint256 quorumsLen = quorums.length;
    for (uint256 i = 0; i < quorumsLen; ) {
      _upsertQuorum(quorums[i].id, quorums[i].quorum);

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
  ) external payable override onlyBootloader {
    _validateTransaction(_hashTx(transaction), transaction);
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
    SystemContractsCaller.systemCall(
      uint32(gasleft()),
      address(NONCE_HOLDER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (transaction.reserved[0]))
    );

    if (hasBeenExecuted(txHash)) revert TxAlreadyExecuted();

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

  function prePaymaster(
    bytes32, // txHash
    bytes32, // suggestedSignedHash
    Transaction calldata transaction
  ) external payable override onlyBootloader {
    TransactionHelper.processPaymasterInput(transaction);
  }

  /*//////////////////////////////////////////////////////////////
                             USER MANAGEMENT
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc IAccount
  function upsertQuorum(QuorumId id, Quorum calldata quorum) external onlySelf {
    _upsertQuorum(id, quorum);
  }

  /// @inheritdoc IAccount
  function removeQuorum(QuorumId id) external onlySelf {
    delete _quorums()[id];
    emit QuorumRemoved(id);
  }

  function _upsertQuorum(QuorumId id, Quorum calldata quorum) internal {
    _quorums()[id] = quorum;
    emit QuorumUpserted(id, quorum);
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
    (QuorumId quorumId, bytes[] memory signatures) = abi.decode(signature, (QuorumId, bytes[]));

    _validateSignatures(hash, _quorums()[quorumId].approvers, signatures);
  }

  function _validateSignatures(
    bytes32 hash,
    address[] memory approvers,
    bytes[] memory signatures
  ) internal view {
    if ((approvers.length) != signatures.length) revert ApproverSignaturesMismatch();

    for (uint256 i = 0; i < approvers.length; ) {
      if (!approvers[i].isValidSignatureNow(hash, signatures[i]))
        revert InvalidSignature(approvers[i]);

      unchecked {
        ++i;
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                            USER MERKLE ROOTS
    //////////////////////////////////////////////////////////////*/

  function _quorums() internal pure returns (mapping(QuorumId => Quorum) storage s) {
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
