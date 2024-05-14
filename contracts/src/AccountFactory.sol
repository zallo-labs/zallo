// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.25;

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
                                                                                                                             
  █████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗███╗   ██╗████████╗    ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
 ██╔══██╗██╔════╝██╔════╝██╔═══██╗██║   ██║████╗  ██║╚══██╔══╝    ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
 ███████║██║     ██║     ██║   ██║██║   ██║██╔██╗ ██║   ██║       █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝ 
 ██╔══██║██║     ██║     ██║   ██║██║   ██║██║╚██╗██║   ██║       ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝  
 ██║  ██║╚██████╗╚██████╗╚██████╔╝╚██████╔╝██║ ╚████║   ██║       ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║   
 ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝       ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   

*/

contract AccountFactory {
  IContractDeployer.AccountAbstractionVersion private constant AA_VERSION =
    IContractDeployer.AccountAbstractionVersion.Version1;

  bytes32 public immutable BYTECODE_HASH;

  constructor(bytes32 bytecodeHash) {
    BYTECODE_HASH = bytecodeHash;
  }

  function deploy(
    bytes calldata constructorArgsData,
    bytes32 salt
  ) public payable returns (address account) {
    bytes memory data = SystemContractsCaller.systemCallWithPropagatedRevert(
      uint32(gasleft()), // safe truncation
      address(DEPLOYER_SYSTEM_CONTRACT),
      0,
      abi.encodeCall(
        DEPLOYER_SYSTEM_CONTRACT.create2Account,
        (salt, BYTECODE_HASH, constructorArgsData, AA_VERSION)
      )
    );

    (account) = abi.decode(data, (address));
  }
}
