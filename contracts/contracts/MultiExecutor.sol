// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

struct Op {
  address to;
  uint256 value;
  bytes data;
}

contract MultiExecutor {
  error ExecutionReverted();

  function multiExecute(Op[] calldata ops)
    internal
    returns (bytes[] memory responses)
  {
    responses = new bytes[](ops.length);
    for (uint i = 0; i < ops.length; ) {
      responses[i] = _callOp(ops[i]);

      unchecked {
        ++i;
      }
    }
  }

  function _callOp(Op calldata op) private returns (bytes memory) {
    (bool success, bytes memory response) = op.to.call{value: op.value}(
      op.data
    );

    if (!success) {
      if (response.length > 0) {
        assembly {
          let returndata_size := mload(response)
          revert(add(32, response), returndata_size)
        }
      } else {
        revert ExecutionReverted();
      }
    }

    return response;
  }
}
