// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

import {UnitTest} from 'test/UnitTest.sol';
import {ERC1271} from 'src/validation/signature/ERC1271.sol';

contract ERC1271Test is UnitTest {
  function test_verify_HashSigned() public {
    bytes32 hash = bytes32(uint256(1));
    bytes memory signature = bytes('custom signature');

    address signer = makeAddr('signer');
    vm.mockCall(
      signer,
      abi.encodeWithSelector(IERC1271.isValidSignature.selector),
      abi.encode(IERC1271.isValidSignature.selector)
    );

    assertTrue(ERC1271.verify(signer, hash, signature));
  }

  function test_verify_FailWhen_VerificationFails() public {
    address signer = makeAddr('signer');
    vm.mockCall(signer, abi.encodeWithSelector(IERC1271.isValidSignature.selector), bytes(''));

    bytes32 hash = bytes32(uint256(1));
    bytes memory signature = bytes('custom signature');
    assertFalse(ERC1271.verify(signer, hash, signature));
  }

  // FIXME: test is not using fixture ??
  bytes[] public fixtureRevertReason = [
    bytes(''),
    abi.encode(true),
    abi.encode(IERC1271.isValidSignature.selector)
  ];

  function test_verify_FailWhen_VerificationReverts(bytes memory revertReason) public {
    address signer = makeAddr('signer');
    vm.mockCallRevert(
      signer,
      abi.encodeWithSelector(IERC1271.isValidSignature.selector),
      revertReason
    );

    bytes32 hash = bytes32(uint256(1));
    bytes memory signature = bytes('custom signature');
    assertFalse(ERC1271.verify(signer, hash, signature));
  }
}
