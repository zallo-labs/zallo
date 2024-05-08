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
      signature
    );
    if (hash != keccak256(message)) revert WrongMessageInSignature();

    policy.hooks.validateMessage(message);

    if (ApprovalsLib.verify(approvals, _hash(message), policy)) magicValue = EIP1271_SUCCESS;
  }

  function _decodeSignature(
    bytes calldata signature
  ) private view returns (bytes memory message, Policy memory policy, Approvals memory approvals) {
    (message, policy, approvals) = abi.decode(signature, (bytes, Policy, Approvals));
    PolicyLib.verify(policy);
  }

  function _hash(bytes memory message) private view returns (bytes32) {
    bytes32 structHash = keccak256(abi.encode(MESSAGE_TYPE_HASH, keccak256(message)));
    return TypedData.hashTypedData(structHash);
  }
}
