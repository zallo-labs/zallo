// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import {Policy, PolicyLib} from '../policy/Policy.sol';
import {Approvals} from '../policy/ApprovalsVerifier.sol';
import {TypedData} from './TypedData.sol';
import {PolicyLib} from '../policy/Policy.sol';

library MessageLib {
  bytes32 private constant MESSAGE_TYPE_HASH = keccak256('Message(bytes message)');

  function decodeSignature(
    bytes calldata signature
  ) internal view returns (bytes memory message, Policy memory policy, Approvals memory approvals) {
    (message, policy, approvals) = abi.decode(signature, (bytes, Policy, Approvals));
    PolicyLib.verify(policy);
  }

  function hash(bytes memory message) internal view returns (bytes32) {
    bytes32 structHash = keccak256(abi.encode(MESSAGE_TYPE_HASH, keccak256(message)));
    return TypedData.hashTypedData(structHash);
  }
}
