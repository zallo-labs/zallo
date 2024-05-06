// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC165} from '@openzeppelin/contracts/interfaces/IERC165.sol';
import {IERC721Receiver} from '@openzeppelin/contracts/interfaces/IERC721Receiver.sol';
import {IERC1155Receiver} from '@openzeppelin/contracts/interfaces/IERC1155Receiver.sol';

abstract contract TokenReceiver is IERC165, IERC721Receiver, IERC1155Receiver {
  bytes4 private constant ERC721_RECEIVED_SUCCESS_MAGIC = IERC721Receiver.onERC721Received.selector;
  bytes4 private constant ERC1155_RECEIVED_SUCCESS_MAGIC =
    IERC1155Receiver.onERC1155Received.selector;
  bytes4 private constant ERC1155_BATCH_RECEIVED_SUCCESS_MAGIC =
    IERC1155Receiver.onERC1155BatchReceived.selector;

  /// @inheritdoc IERC165
  function supportsInterface(bytes4 interfaceId) external pure virtual returns (bool) {
    return
      interfaceId == type(IERC165).interfaceId ||
      interfaceId == type(IERC721Receiver).interfaceId ||
      interfaceId == type(IERC1155Receiver).interfaceId;
  }

  /// @inheritdoc IERC721Receiver
  function onERC721Received(
    address /* operator */,
    address /* from */,
    uint256 /* tokenId */,
    bytes calldata /* data */
  ) external pure override returns (bytes4 magic) {
    return ERC721_RECEIVED_SUCCESS_MAGIC;
  }

  /// @inheritdoc IERC1155Receiver
  function onERC1155Received(
    address /* operator */,
    address /* from */,
    uint256 /* id */,
    uint256 /* value */,
    bytes calldata /* data */
  ) external pure override returns (bytes4 magic) {
    return ERC1155_RECEIVED_SUCCESS_MAGIC;
  }

  /// @inheritdoc IERC1155Receiver
  function onERC1155BatchReceived(
    address /* operator */,
    address /* from */,
    uint256[] calldata /* ids */,
    uint256[] calldata /* values */,
    bytes calldata /* data */
  ) external pure override returns (bytes4 magic) {
    return ERC1155_BATCH_RECEIVED_SUCCESS_MAGIC;
  }
}
