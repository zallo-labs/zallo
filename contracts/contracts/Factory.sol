// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/SystemContractsCaller.sol';

contract Factory {
  bytes32 public immutable _BYTECODE_HASH;

  error DeployFailed(address account, bytes revertData);

  constructor(bytes32 bytecodeHash) {
    _BYTECODE_HASH = bytecodeHash;
  }

  function deploy(
    bytes calldata constructorArgsData,
    bytes32 salt
  ) external returns (address account) {
    (bool success, bytes memory data) = SystemContractsCaller.systemCallWithReturndata(
      uint32(gasleft()),
      address(DEPLOYER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(IContractDeployer.create2Account, (salt, _BYTECODE_HASH, constructorArgsData))
    );

    if (!success) {
      bytes memory revertData;
      (account, revertData) = abi.decode(data, (address, bytes));
      revert DeployFailed(account, revertData);
    }

    (account, ) = abi.decode(data, (address, bytes));
  }
}
