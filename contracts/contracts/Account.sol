// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {
  SignatureChecker
} from '@matterlabs/signature-checker/contracts/SignatureChecker.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/TransactionHelper.sol';

import './IAccount.sol';
import './SelfOwned.sol';
import './Initializable.sol';
import './Upgradeable.sol';
import './TransactionExecutor.sol';
import './ERC165.sol';
import './ERC721Receiver.sol';
import {MerkleProof} from './utils/MerkleProof.sol';
import {BoolArray} from './utils/BoolArray.sol';

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
    // Prevent direct use of the contract, only allowing use through a proxy and thereby preventing selfdestruct nonsense
    _preventInitialization();
  }

  function initialize(User calldata user) external initializer {
    _upsertUser(user);
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
  function validateTransaction(Transaction calldata transaction)
    external
    payable
    override
  {
    _validateTransaction(_hashTx(transaction), transaction);
  }

  /// @inheritdoc BaseIAccount
  function executeTransaction(Transaction calldata transaction)
    external
    payable
    override
    onlyBootloader
  {
    _executeTransaction(_hashTx(transaction), transaction);
  }

  /// @inheritdoc BaseIAccount
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
                                PAYMASTER
  //////////////////////////////////////////////////////////////*/

  function payForTransaction(Transaction calldata transaction)
    external
    payable
    override
    onlyBootloader
  {
    bool success = TransactionHelper.payToTheBootloader(transaction);
    require(success, 'Failed to pay the fee to the operator');
  }

  function prePaymaster(Transaction calldata transaction)
    external
    payable
    override
    onlyBootloader
  {
    TransactionHelper.processPaymasterInput(transaction);
  }

  /*//////////////////////////////////////////////////////////////
                             USER MANAGEMENT
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc IAccount
  function upsertUser(User calldata user) external onlySelf {
    _upsertUser(user);
  }

  /// @inheritdoc IAccount
  function removeUser(address user) external onlySelf {
    delete _userMerkleRoots()[user];
    emit UserRemoved(user);
  }

  function _upsertUser(User calldata user) internal {
    _userMerkleRoots()[user.addr] = user.merkleRoot();
    emit UserUpserted(user);
  }

  /*//////////////////////////////////////////////////////////////
                          SIGNATURE VALIDATION
  //////////////////////////////////////////////////////////////*/

  /// @inheritdoc IERC1271
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
      address user,
      UserConfig memory config,
      bytes32[] memory proof,
      bytes[] memory signatures
    ) = abi.decode(txSignature, (address, UserConfig, bytes32[], bytes[]));

    _validateSignatures(txHash, user, config.approvers, signatures);
    if (!config.isValidProof(proof, _userMerkleRoots()[user]))
      revert InvalidProof();
  }

  function _validateSignatures(
    bytes32 txHash,
    address user,
    address[] memory approvers,
    bytes[] memory signatures
  ) internal view {
    if ((1 + approvers.length) != signatures.length)
      revert ApproverSignaturesMismatch();

    if (!user.isValidSignatureNow(txHash, signatures[0]))
      revert InvalidSignature(user);

    for (uint256 i = 0; i < approvers.length; ) {
      if (!approvers[i].isValidSignatureNow(txHash, signatures[i + 1]))
        revert InvalidSignature(approvers[i]);

      unchecked {
        ++i;
      }
    }
  }

  /*//////////////////////////////////////////////////////////////
                            USER MERKLE ROOTS
    //////////////////////////////////////////////////////////////*/

  // TODO: upgrade to solc 0.8.17 (once supported by zksolc) and set mapping slot directly
  struct UserMerkleRootsStruct {
    mapping(address => bytes32) userMerkleRoots;
  }

  /// @notice Merkle root of the state of each wallet
  /// @dev user => merkleRoot
  /// @dev Leaves: UserConfig[]
  function _userMerkleRoots()
    internal
    view
    returns (mapping(address => bytes32) storage)
  {
    UserMerkleRootsStruct storage s;

    assembly {
      // keccack256('Account.userMerkleRoots')
      s.slot := 0x78da1ddd953b1b2068017cdffdd8ba08689d560b1fa20cf0f77a87af370f3f89
    }

    return s.userMerkleRoots;
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
