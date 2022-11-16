// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

/// @notice Call to execute
/// @param to Address to call
/// @param value Wei to send
/// @param data Bytes to send
struct Call {
  address to;
  uint256 value;
  bytes data;
}

contract Multicall {
  /// @notice Error when the call reverts without a reason
  error CallReverted();

  /// @notice Execute a series of calls, reverting if any of them fails
  /// @dev Upon reverting the reason is propagated if one is provided, otherwise CallReverted is used
  /// @param calls Array of calls to execute
  /// @return responses Array of responses to the calls
  function multicall(Call[] calldata calls) external returns (bytes[] memory responses) {
    responses = new bytes[](calls.length);
    for (uint i = 0; i < calls.length; ) {
      responses[i] = _call(calls[i]);

      unchecked {
        ++i;
      }
    }
  }

  function _call(Call calldata call) internal returns (bytes memory) {
    (bool success, bytes memory response) = call.to.call{value: call.value}(call.data);

    if (!success) {
      if (response.length > 0) {
        assembly {
          let returndata_size := mload(response)
          revert(add(32, response), returndata_size)
        }
      } else {
        revert CallReverted();
      }
    }

    return response;
  }
}
