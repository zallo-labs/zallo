// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol';

import {Policy} from './policy/Policy.sol';
import {Approvals} from './policy/ApprovalsVerifier.sol';
import {Hook} from './policy/hooks/Hooks.sol';
import {Cast} from './libraries/Cast.sol';
import {PaymasterUtil} from './paymaster/PaymasterUtil.sol';

struct Operation {
  address to;
  uint96 value; /// @dev uint96 (instead of uint128 max) to allow packing
  bytes data;
}

/// @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
library TransactionUtil {
  using Cast for uint256;

  bytes32 private constant DOMAIN_TYPE_HASH =
    keccak256('EIP712Domain(uint256 chainId,address verifyingContract)');

  bytes32 private constant TX_TYPE_HASH =
    keccak256(
      'Tx(address to,uint256 value,bytes data,uint256 nonce,address paymaster,bytes32 paymasterInputHash)'
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
        PaymasterUtil.hash(t.paymasterInput)
      )
    );

    return keccak256(abi.encodePacked('\x19\x01', _domainSeparator(), structHash));
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

  function hooks(Transaction calldata t) internal pure returns (Hook[] memory hooks) {
    if (isGasEstimation(t)) return new Hook[](0);

    Policy memory policy;
    (, policy, ) = abi.decode(t.signature, (uint32, Policy, Approvals));

    return policy.hooks;
  }

  /// @dev estimateGas always calls with a 65 byte signature
  function isGasEstimation(Transaction calldata t) internal pure returns (bool) {
    return t.signature.length == 65;
  }

  function _domainSeparator() private view returns (bytes32) {
    // Can't be set immutably as it will be called by a proxy and depends on address(this)
    return keccak256(abi.encode(DOMAIN_TYPE_HASH, block.chainid, address(this)));
  }

  function _proposalNonce(Transaction calldata t) private pure returns (uint32) {
    return abi.decode(t.signature, (uint32));
  }
}
