// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

contract Factory {
  bytes32 public immutable safeBytecodeHash;

  constructor(bytes32 _safeBytecodeHash) {
    safeBytecodeHash = _safeBytecodeHash;
  }

  function deploySafe(bytes32 _salt, bytes calldata _constructorArgsData)
    external
    returns (address)
  {
    return
      DEPLOYER_SYSTEM_CONTRACT.create2AA(
        _salt,
        safeBytecodeHash,
        0,
        _constructorArgsData
      );
  }
}
