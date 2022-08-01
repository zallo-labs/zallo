// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  SignatureChecker
} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

import './ISafe.sol';
import './SelfOwned.sol';
import './Initializable.sol';
import './Upgradeable.sol';
import './TransactionExecutor.sol';
import './ERC165.sol';
import './ERC721Receiver.sol';
import {MerkleProof} from './utils/MerkleProof.sol';
import {BoolArray} from './utils/BoolArray.sol';

contract Safe is
  ISafe,
  SelfOwned,
  Initializable,
  Upgradeable,
  TransactionExecutor,
  ERC165,
  ERC721Receiver
{
  using SignatureChecker for address;
  using MerkleProof for bytes32[];

  /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
  //////////////////////////////////////////////////////////////*/

  constructor() {
    // Prevent the contract from being initialized, thereby only allowing use through a proxy
    _preventInitialization();
  }

  function initialize(Ref accountRef, address[][] memory quorums)
    external
    initializer
  {
    _upsertAccount(accountRef, quorums);
  }

  /*//////////////////////////////////////////////////////////////
                                FALLBACK
  //////////////////////////////////////////////////////////////*/

  receive() external payable {}

  fallback() external payable {}

  /*//////////////////////////////////////////////////////////////
                          TRANSACTION HANDLING
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc ISafe
  function validateTransaction(Transaction calldata transaction)
    external
    payable
    override
  {
    _validateTransaction(_hashTx(transaction), transaction);
  }

  /// @inheritdoc ISafe
  function executeTransaction(Transaction calldata transaction)
    external
    payable
    override
    onlyBootloader
  {
    _executeTransaction(_hashTx(transaction), transaction);
  }

  /// @inheritdoc ISafe
  function executeTransactionFromOutside(Transaction calldata transaction)
    external
    payable
    override
  {
    bytes32 txHash = _hashTx(transaction);
    _validateTransaction(txHash, transaction);
    _executeTransaction(txHash, transaction);
  }

  function _validateTransaction(
    bytes32 txHash,
    Transaction calldata transaction
  ) internal {
    NONCE_HOLDER_SYSTEM_CONTRACT.incrementNonceIfEquals(
      transaction.reserved[0] // nonce
    );

    if (hasBeenExecuted(txHash)) revert TxAlreadyExecuted();

    _validateSignature(txHash, transaction.signature);
  }

  /*//////////////////////////////////////////////////////////////
                            GROUP MANAGEMENT
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc ISafe
  function upsertAccount(Ref accountRef, address[][] calldata quorums)
    external
    onlySelf
  {
    _upsertAccount(accountRef, quorums);
  }

  /// @inheritdoc ISafe
  function removeAccount(Ref accountRef) external onlySelf {
    delete _accountMerkleRoots()[accountRef];
    emit AccountRemoved(accountRef);
  }

  function _upsertAccount(Ref accountRef, address[][] memory quorums) internal {
    bytes32[] memory leaves = _getQuorumsMerkleLeaves(quorums);
    _accountMerkleRoots()[accountRef] = leaves.merkleRoot();

    emit AccountUpserted(accountRef, quorums);
  }

  /*//////////////////////////////////////////////////////////////
                          SIGNATURE VALIDATION
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc ISafe
  function isValidSignature(bytes32 txHash, bytes memory txSignature)
    external
    view
    override
    returns (bytes4)
  {
    _validateSignature(txHash, txSignature);
    return EIP1271_SUCCESS;
  }

  function _validateSignature(bytes32 txHash, bytes memory txSignature)
    internal
    view
  {
    (
      Ref accountRef,
      address[] memory quorum,
      bytes[] memory signatures,
      bytes32[] memory proof,
      uint256[] memory proofFlags
    ) = abi.decode(
        txSignature,
        (Ref, address[], bytes[], bytes32[], uint256[])
      );

    _validateSigners(txHash, quorum, signatures);
    _verifyMultiProof(
      _accountMerkleRoots()[accountRef],
      proof,
      proofFlags,
      quorum
    );
  }

  function _validateSigners(
    bytes32 txHash,
    address[] memory quorum,
    bytes[] memory signatures
  ) internal view {
    if (quorum.length != signatures.length) revert ApproverSignaturesMismatch();

    for (uint256 i = 0; i < quorum.length; ) {
      if (!quorum[i].isValidSignatureNow(txHash, signatures[i]))
        revert InvalidSignature(quorum[i]);

      unchecked {
        ++i;
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                           GROUP MERKLE ROOTS
  //////////////////////////////////////////////////////////////*/

  // TODO: set mapping directly once "Invalid stack item name: slot" is fixed - https://github.com/ethereum/solidity/issues/13259
  struct AccountMerkleRootsStruct {
    mapping(Ref => bytes32) accountMerkleRoots;
  }

  /// @notice Merkle root of the state of each account
  /// @dev accountRef => merkleRoot
  /// @dev Leaves: [approver 1, ..., approver n]
  function _accountMerkleRoots()
    internal
    view
    returns (mapping(Ref => bytes32) storage)
  {
    AccountMerkleRootsStruct storage s;
    assembly {
      // keccack256('Safe.accountMerkleRoots')
      s.slot := 0x421bd8653147f40ab61f0a77b49453d98827367bebd29b1035f755b045bfdb1a
    }

    return s.accountMerkleRoots;
  }

  function _verifyMultiProof(
    bytes32 root,
    bytes32[] memory proof,
    uint256[] memory proofFlags,
    address[] memory quorum
  ) internal pure {
    bytes32[] memory leaves = new bytes32[](1);
    leaves[0] = _getQuorumMerkleLeaf(quorum);
    if (proof.processMultiProof(proofFlags, leaves) != root)
      revert InvalidProof();
  }

  function _getQuorumMerkleLeaf(address[] memory quorum)
    internal
    pure
    returns (bytes32)
  {
    if (quorum.length == 0) revert EmptyQuorum();

    // Ensure quorum is sorted ascending
    for (uint256 i = 1; i < quorum.length; ) {
      if (quorum[i] < quorum[i - 1]) revert QuorumNotAscending();

      unchecked {
        ++i;
      }
    }

    return keccak256(abi.encode(quorum));
  }

  function _getQuorumsMerkleLeaves(address[][] memory quorums)
    internal
    pure
    returns (bytes32[] memory leaves)
  {
    if (quorums.length == 0) revert EmptyQuorums();

    leaves = new bytes32[](quorums.length);
    for (uint256 i = 0; i < quorums.length; ) {
      leaves[i] = _getQuorumMerkleLeaf(quorums[i]);

      // Leaves need to be sorted asc and unique
      if (i > 0 && leaves[i] < leaves[i - 1])
        revert QuorumHashesNotUniqueAndAscending();

      unchecked {
        ++i;
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                                MODIFIERS
  //////////////////////////////////////////////////////////////*/

  modifier onlyBootloader() {
    if (msg.sender != BOOTLOADER_FORMAL_ADDRESS)
      revert OnlyCallableByBootloader();
    _;
  }
}
