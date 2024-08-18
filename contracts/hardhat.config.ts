import type { HardhatUserConfig } from 'hardhat/config';
import { CONFIG } from './config';
import { CHAINS } from 'chains';

import '@nomicfoundation/hardhat-foundry';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-viem';
import '@nomiclabs/hardhat-solhint'; // https://github.com/protofire/solhint/blob/master/docs/rules.md
import '@matterlabs/hardhat-zksync-solc';
import '@matterlabs/hardhat-zksync-verify';
import 'hardhat-abi-exporter';
import '@solidstate/hardhat-4byte-uploader';

// Tasks
import './task/export';
import './task/upload-openchain';

// https://hardhat.org/config/
export default {
  solidity: {
    version: '0.8.26',
  },
  zksolc: {
    version: '1.5.2', // https://github.com/matter-labs/zksolc-bin/tree/main/linux-amd64
    settings: {
      enableEraVMExtensions: true,
      optimizer: {
        enabled: true,
        mode: '3',
      },
    },
  },
  defaultNetwork: CONFIG.chain.key,
  networks: {
    // https://hardhat.org/hardhat-network/reference/
    hardhat: { zksync: true },

    ...Object.fromEntries(
      Object.values(CHAINS).map((chain) => [
        chain.key,
        {
          zksync: true,
          chainId: chain.id,
          url: chain.rpcUrls.default.http[0],
          ethNetwork: chain.layer1?.rpcUrls.default.http[0] ?? '',
          verifyURL: chain.verifyUrl,
        },
      ]),
    ),
  },
  // Plugins
  abiExporter: {
    path: './abi',
    runOnCompile: false,
    clear: true,
  },
  export: [
    {
      path: 'script/contracts',
      contracts: ['^src\\/.*:((Account.*)|(Deployer)|(Paymaster))$'],
      include: ['abi', 'contractName', 'bytecode', 'factoryDeps'],
    },
    {
      path: '../packages/lib/src/abi',
      contracts: ['^src\\/.*:((Account.*)|(Paymaster)|(PaymasterFlows)|(Expose))$'],
      include: ['abi', 'bytecode', 'factoryDeps'],
    },
  ],
  fourByteUploader: {},
} satisfies HardhatUserConfig;
