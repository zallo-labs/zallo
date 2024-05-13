// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import {IERC721Receiver} from '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import {IERC1155Receiver} from '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';

abstract contract TokenReceiver is IERC165, IERC721Receiver, IERC1155Receiver {
  /// @inheritdoc IERC165
  function supportsInterface(bytes4 interfaceId) external pure virtual returns (bool) {
    return
      interfaceId == type(IERC165).interfaceId ||
      interfaceId == type(IERC721Receiver).interfaceId ||
      interfaceId == type(IERC1155Receiver).interfaceId;
  }

  /// @notice Native token receiver
  /// @notice zkSync native transfers emit a Transfer event
  receive() external payable {}

  /// @inheritdoc IERC721Receiver
  function onERC721Received(
    address /* operator */,
    address /* from */,
    uint256 /* tokenId */,
    bytes calldata /* data */
  ) external pure override returns (bytes4 magic) {
    return IERC721Receiver.onERC721Received.selector;
  }

  /// @inheritdoc IERC1155Receiver
  function onERC1155Received(
    address /* operator */,
    address /* from */,
    uint256 /* id */,
    uint256 /* value */,
    bytes calldata /* data */
  ) external pure override returns (bytes4 magic) {
    return IERC1155Receiver.onERC1155Received.selector;
  }

  /// @inheritdoc IERC1155Receiver
  function onERC1155BatchReceived(
    address /* operator */,
    address /* from */,
    uint256[] calldata /* ids */,
    uint256[] calldata /* values */,
    bytes calldata /* data */
  ) external pure override returns (bytes4 magic) {
    return IERC1155Receiver.onERC1155BatchReceived.selector;
  }
}
