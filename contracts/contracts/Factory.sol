// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

contract Factory {
  IContractDeployer.AccountAbstractionVersion private constant AA_VERSION =
    IContractDeployer.AccountAbstractionVersion.Version1;

  bytes32 public immutable _BYTECODE_HASH;

  error DeployFailed(address account, bytes revertData);

  constructor(bytes32 bytecodeHash) {
    _BYTECODE_HASH = bytecodeHash;
  }

  function deploy(
    bytes calldata constructorArgsData,
    bytes32 salt
  ) external payable returns (address account) {
    (bool success, bytes memory data) = SystemContractsCaller.systemCallWithReturndata(
      uint32(gasleft()),
      address(DEPLOYER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(
        DEPLOYER_SYSTEM_CONTRACT.create2Account,
        (salt, _BYTECODE_HASH, constructorArgsData, AA_VERSION)
      )
    );

    if (!success) {
      bytes memory revertData;
      (account, revertData) = abi.decode(data, (address, bytes));
      revert DeployFailed(account, revertData);
    }

    (account) = abi.decode(data, (address));
  }
}
