// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {IERC165} from '@openzeppelin/contracts/interfaces/IERC165.sol';

import {IERC721Receiver} from './ERC721Receiver.sol';
import {IERC1155Receiver} from './ERC1155Receiver.sol';

abstract contract ERC165 is IERC165 {
  /// @inheritdoc IERC165
  function supportsInterface(bytes4 interfaceId) external pure virtual returns (bool) {
    return
      interfaceId == type(IERC165).interfaceId ||
      interfaceId == type(IERC721Receiver).interfaceId ||
      interfaceId == type(IERC1155Receiver).interfaceId;
  }
}
