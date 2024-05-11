// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

import {Policy, PolicyLib} from './Policy.sol';
import {Approvals, ApprovalsLib} from './Approvals.sol';
import {Hooks, Hook} from './hooks/Hooks.sol';
import {TypedData} from 'src/libraries/TypedData.sol';

abstract contract MessageValidator is IERC1271 {
  using Hooks for Hook[];

  error WrongMessageInSignature();

  bytes4 private constant EIP1271_SUCCESS = IERC1271.isValidSignature.selector;
  bytes32 private constant MESSAGE_TYPE_HASH = keccak256('Message(bytes message)');

  function isValidSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bytes4 magicValue) {
    (bytes memory message, Policy memory policy, Approvals memory approvals) = _decodeSignature(
      hash,
      signature
    );

    policy.hooks.validateMessage(message);

    if (ApprovalsLib.verify(approvals, _signedMessageHash(message), policy))
      magicValue = EIP1271_SUCCESS;
  }

  function _decodeSignature(
    bytes32 hash,
    bytes calldata signature
  ) private view returns (bytes memory message, Policy memory policy, Approvals memory approvals) {
    (message, policy, approvals) = abi.decode(signature, (bytes, Policy, Approvals));

    if (hash != keccak256(message)) revert WrongMessageInSignature();

    PolicyLib.verify(policy);
  }

  function _signedMessageHash(bytes memory message) internal view returns (bytes32) {
    bytes32 structHash = keccak256(abi.encode(MESSAGE_TYPE_HASH, keccak256(message)));
    return TypedData.hashTypedData(structHash);
  }
}
