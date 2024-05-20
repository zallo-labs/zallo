// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {DEPLOYER_SYSTEM_CONTRACT} from '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';
import {IContractDeployer} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IContractDeployer.sol';
import {SystemContractsCaller} from '@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol';

/*
 
 ███████╗ █████╗ ██╗     ██╗      ██████╗                          
 ╚══███╔╝██╔══██╗██║     ██║     ██╔═══██╗                         
   ███╔╝ ███████║██║     ██║     ██║   ██║                         
  ███╔╝  ██╔══██║██║     ██║     ██║   ██║                         
 ███████╗██║  ██║███████╗███████╗╚██████╔╝                         
 ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝                          
                                                                   
 ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗███████╗██████╗ 
 ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝██╔════╝██╔══██╗
 ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ █████╗  ██████╔╝
 ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██╔══╝  ██╔══██╗
 ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝
 
*/

/// @notice Create2 deployer that prevents withholding of deployments due to dependence on `msg.sender`
contract Deployer {
  error ExcessiveMsgValue(uint256 maxAllowedMsgValue);

  function create2(
    bytes32 salt,
    bytes32 bytecodeHash,
    bytes calldata constructorData
  ) external payable returns (address newAddress) {
    bytes memory returnData = _safeCallDeployer(
      abi.encodeCall(DEPLOYER_SYSTEM_CONTRACT.create2, (salt, bytecodeHash, constructorData))
    );

    newAddress = abi.decode(returnData, (address));
  }

  function create2Account(
    bytes32 salt,
    bytes32 bytecodeHash,
    bytes calldata constructorData,
    IContractDeployer.AccountAbstractionVersion aaVersion
  ) external payable returns (address newAddress) {
    bytes memory returnData = _safeCallDeployer(
      abi.encodeCall(
        DEPLOYER_SYSTEM_CONTRACT.create2Account,
        (salt, bytecodeHash, constructorData, aaVersion)
      )
    );

    newAddress = abi.decode(returnData, (address));
  }

  function _safeCallDeployer(bytes memory data) internal returns (bytes memory returnData) {
    if (msg.value > type(uint128).max) revert ExcessiveMsgValue(type(uint128).max);

    returnData = SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()), // safe truncation
      address(DEPLOYER_SYSTEM_CONTRACT),
      uint128(msg.value), // truncation impossible
      data
    );
  }
}
