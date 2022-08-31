// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

contract Factory {
  bytes32 public immutable _BYTECODE_HASH;

  constructor(bytes32 bytecodeHash) {
    _BYTECODE_HASH = bytecodeHash;
  }

  function deploy(bytes32 salt, bytes calldata constructorArgsData)
    external
    returns (address newAddress, bytes memory constructorRevertData)
  {
    return
      DEPLOYER_SYSTEM_CONTRACT.create2Account(
        salt,
        _BYTECODE_HASH,
        0,
        constructorArgsData
      );
  }
}
