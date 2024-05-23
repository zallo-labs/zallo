// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {IERC165, ERC165Checker} from '@openzeppelin/contracts/utils/introspection/ERC165Checker.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {IERC721Receiver} from '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import {ERC1155} from '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import {IERC1155Receiver} from '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';

import {UnitTest} from 'test/UnitTest.sol';
import {TokenReceiver} from 'src/core/TokenReceiver.sol';

contract TokenReceiverTest is UnitTest {
  TokenReceiver internal receiver = new TestTokenReceiver();

  /*//////////////////////////////////////////////////////////////
                                 ERC165
  //////////////////////////////////////////////////////////////*/

  function test_erc165_SupportsInterface() public view {
    assertTrue(ERC165Checker.supportsERC165(address(receiver)));
  }

  /*//////////////////////////////////////////////////////////////
                              NATIVE TOKEN
  //////////////////////////////////////////////////////////////*/

  function testFuzz_receive_Receive(uint64 amount) public {
    vm.assume(0 < amount && amount < (address(this).balance - 1 ether));

    uint256 pre = address(receiver).balance;
    (bool success, ) = address(receiver).call{value: amount}('');

    assertTrue(success);
    assertEq(address(receiver).balance - pre, amount);
  }

  function testFuzz_receive_EmitEvent(uint64 amount) public {
    vm.assume(0 < amount && amount < (address(this).balance - 1 ether));

    vm.expectEmit(true, true, true, true);
    emit IERC20.Transfer(address(this), address(receiver), amount);

    (bool success, ) = address(receiver).call{value: amount}('');
    assertTrue(success);
  }

  /*//////////////////////////////////////////////////////////////
                                 ERC721
  //////////////////////////////////////////////////////////////*/

  function test_erc721_SupportsInterface() public view {
    assertTrue(
      ERC165Checker.supportsInterface(address(receiver), type(IERC721Receiver).interfaceId)
    );
  }

  function testFuzz_erc721_Receive(uint256 tokenId) public {
    TestErc721 token = new TestErc721();

    token.safeMint(address(receiver), tokenId);
    assertEq(token.ownerOf(tokenId), address(receiver));
  }

  /*//////////////////////////////////////////////////////////////
                                ERC1155
  //////////////////////////////////////////////////////////////*/

  function test_erc1155_SupportsInterface() public view {
    assertTrue(
      ERC165Checker.supportsInterface(address(receiver), type(IERC1155Receiver).interfaceId)
    );
  }

  function testFuzz_erc721_SingleReceive(uint256 id, uint256 value, bytes memory data) public {
    TestErc1155 token = new TestErc1155();

    token.mint(address(receiver), id, value, data);
    assertEq(token.balanceOf(address(receiver), id), value);
  }

  function testFuzz_erc721_BatchReceive(uint256 id, uint256 value, bytes memory data) public {
    uint256[] memory ids = new uint256[](1);
    ids[0] = id;
    uint256[] memory values = new uint256[](1);
    values[0] = value;

    TestErc1155 token = new TestErc1155();
    token.mintBatch(address(receiver), ids, values, data);

    for (uint256 i; i < ids.length; ++i) {
      assertEq(token.balanceOf(address(receiver), ids[i]), values[i]);
    }
  }
}

contract TestTokenReceiver is TokenReceiver {}

contract TestErc721 is ERC721 {
  constructor() ERC721('', '') {}

  function safeMint(address to, uint256 tokenId) external {
    _safeMint(to, tokenId);
  }
}

contract TestErc1155 is ERC1155 {
  constructor() ERC1155('') {}

  function mint(address to, uint256 id, uint256 value, bytes memory data) external {
    _mint(to, id, value, data);
  }

  function mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory values,
    bytes memory data
  ) external {
    _mintBatch(to, ids, values, data);
  }
}
