// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

contract Factory {
  bytes32 public _bytecodeHash;

  constructor(bytes32 bytecodeHash) {
    _bytecodeHash = bytecodeHash;
  }

  function deploy(bytes32 salt, bytes calldata constructorArgsData)
    external
    returns (address newAddress, bytes memory constructorRevertData)
  {
    return
      DEPLOYER_SYSTEM_CONTRACT.create2Account(
        salt,
        _bytecodeHash,
        0,
        constructorArgsData
      );
  }
}
