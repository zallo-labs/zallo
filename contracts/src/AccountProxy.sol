// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.25;

import {ERC1967Proxy} from '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol';

/*

 ███████╗ █████╗ ██╗     ██╗      ██████╗                                                                   
 ╚══███╔╝██╔══██╗██║     ██║     ██╔═══██╗                                                                  
   ███╔╝ ███████║██║     ██║     ██║   ██║                                                                  
  ███╔╝  ██╔══██║██║     ██║     ██║   ██║                                                                  
 ███████╗██║  ██║███████╗███████╗╚██████╔╝                                                                  
 ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝                                                                   
                                                                                                            
  █████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗███╗   ██╗████████╗    ██████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗
 ██╔══██╗██╔════╝██╔════╝██╔═══██╗██║   ██║████╗  ██║╚══██╔══╝    ██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝╚██╗ ██╔╝
 ███████║██║     ██║     ██║   ██║██║   ██║██╔██╗ ██║   ██║       ██████╔╝██████╔╝██║   ██║ ╚███╔╝  ╚████╔╝ 
 ██╔══██║██║     ██║     ██║   ██║██║   ██║██║╚██╗██║   ██║       ██╔═══╝ ██╔══██╗██║   ██║ ██╔██╗   ╚██╔╝  
 ██║  ██║╚██████╗╚██████╗╚██████╔╝╚██████╔╝██║ ╚████║   ██║       ██║     ██║  ██║╚██████╔╝██╔╝ ██╗   ██║   
 ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝       ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   

*/

contract AccountProxy is ERC1967Proxy {
  constructor(
    address implementation,
    bytes memory data
  ) payable ERC1967Proxy(implementation, data) {}
}
