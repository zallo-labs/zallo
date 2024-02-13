// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Policy, PolicyLib} from '../policy/Policy.sol';
import {Approvals} from '../policy/ApprovalsVerifier.sol';
import {Hook} from '../policy/hooks/Hooks.sol';
import {Cast} from './Cast.sol';
import {TypedData} from './TypedData.sol';
import {PaymasterUtil} from '../paymaster/PaymasterUtil.sol';

struct Operation {
  address to;
  uint96 value; /// @dev uint96 (instead of uint128 max) to allow packing
  bytes data;
}

/// @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
library TransactionUtil {
  using Cast for uint256;

  bytes32 private constant TX_TYPE_HASH =
    keccak256(
      'Tx(address to,uint256 value,bytes data,uint256 nonce,address paymaster,bytes paymasterSignedInput)'
    );

  bytes4 private constant OPERATIONS_SELECTOR = bytes4(0);

  function hash(Transaction calldata t) internal view returns (bytes32) {
    bytes32 structHash = keccak256(
      abi.encode(
        TX_TYPE_HASH,
        t.to,
        t.value,
        keccak256(t.data),
        _proposalNonce(t),
        t.paymaster,
        keccak256(PaymasterUtil.signedInput(t.paymasterInput))
      )
    );

    return TypedData.hashTypedData(structHash);
  }

  function decodeSignature(
    bytes calldata signature
  ) internal view returns (Policy memory policy, Approvals memory approvals) {
    (, policy, approvals) = abi.decode(signature, (uint32, Policy, Approvals));
    PolicyLib.verify(policy);
  }

  function to(Transaction calldata t) internal pure returns (address) {
    return address(uint160(t.to)); // won't truncate
  }

  function operations(Transaction calldata t) internal view returns (Operation[] memory) {
    bool hasOperations = to(t) == address(this) &&
      t.data.length >= 4 &&
      bytes4(t.data[:4]) == OPERATIONS_SELECTOR;

    if (hasOperations) {
      return abi.decode(t.data[4:], (Operation[]));
    } else {
      Operation[] memory ops = new Operation[](1);
      ops[0] = Operation({to: to(t), value: t.value.toU96(), data: t.data});
      return ops;
    }
  }

  function hooks(Transaction calldata t) internal pure returns (Hook[] memory hooks_) {
    if (isGasEstimation(t)) return new Hook[](0);

    Policy memory policy;
    (, policy) = abi.decode(t.signature, (uint32, Policy));

    return policy.hooks;
  }

  /// @dev estimateGas always calls with a 65 byte signature - https://github.com/zkSync-Community-Hub/zksync-developers/discussions/81#discussioncomment-7861481
  function isGasEstimation(Transaction calldata t) internal pure returns (bool) {
    return t.signature.length == 65;
  }

  function _proposalNonce(Transaction calldata t) private pure returns (uint32) {
    return abi.decode(t.signature, (uint32));
  }
}
