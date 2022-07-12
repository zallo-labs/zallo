// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

contract Factory {
  bytes32 public immutable _safeBytecodeHash;

  constructor(bytes32 safeBytecodeHash) {
    _safeBytecodeHash = safeBytecodeHash;
  }

  function deploySafe(bytes32 salt, bytes calldata constructorArgsData)
    external
    returns (address)
  {
    return
      DEPLOYER_SYSTEM_CONTRACT.create2AA(
        salt,
        _safeBytecodeHash,
        0,
        constructorArgsData
      );
  }
}
