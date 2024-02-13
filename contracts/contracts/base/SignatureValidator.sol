// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {IERC1271} from '@openzeppelin/contracts/interfaces/IERC1271.sol';

import {ISignatureValidator} from './ISignatureValidator.sol';
import {Policy, PolicyLib} from '../policy/Policy.sol';
import {Approvals, ApprovalsVerifier} from '../policy/ApprovalsVerifier.sol';
import {TypedData} from '../libraries/TypedData.sol';
import {MessageLib} from '../libraries/MessageLib.sol';
import {Hooks, Hook} from '../policy/hooks/Hooks.sol';

abstract contract SignatureValidator is ISignatureValidator {
  using Hooks for Hook[];

  error WrongMessageInSignature();

  bytes4 private constant EIP1271_SUCCESS = IERC1271.isValidSignature.selector;

  function isValidSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bytes4 magicValue) {
    (bytes memory message, Policy memory policy, Approvals memory approvals) = MessageLib
      .decodeSignature(signature);
    if (hash != keccak256(message)) revert WrongMessageInSignature();

    policy.hooks.validateMessage(message);

    if (ApprovalsVerifier.verify(approvals, MessageLib.hash(message), policy))
      magicValue = EIP1271_SUCCESS;
  }
}
