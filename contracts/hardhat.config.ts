import type { HardhatUserConfig } from 'hardhat/config';
import { CONFIG } from './config';
import { CHAINS } from 'chains';

import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-viem';
import '@nomiclabs/hardhat-solhint'; // https://github.com/protofire/solhint/blob/master/docs/rules.md
import '@nomicfoundation/hardhat-foundry';
import '@matterlabs/hardhat-zksync-chai-matchers';
import '@matterlabs/hardhat-zksync-solc';
import '@matterlabs/hardhat-zksync-verify';
import 'hardhat-gas-reporter';
import 'hardhat-abi-exporter';
import 'hardhat-contract-sizer';
// import 'hardhat-tracer';
// import 'solidity-coverage';
// import './test/util/matchers';
import '@solidstate/hardhat-4byte-uploader';

// Tasks
import './tasks/export';
import './tasks/upload-openchain';

// https://hardhat.org/config/
export default {
  solidity: {
    version: '0.8.25',
  },
  zksolc: {
    version: '1.4.1', // https://github.com/matter-labs/zksolc-bin/tree/main/linux-amd64
    settings: {
      isSystem: true, // Required to deploy AA contracts
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
  gasReporter: {
    // https://github.com/cgewecke/eth-gas-reporter#options
    enabled: true,
    currency: 'USD',
    coinmarketcap: CONFIG.coinmarketcapApiKey,
  },
  export: [
    {
      path: 'test/contracts',
      contracts: ['^src\\/.+', '^@pythnetwork/.*/MockPyth.*'],
      include: ['abi', 'contractName'],
    },
    {
      path: '../packages/lib/src/abi',
      contracts: [
        '^src\\/.*:((Account)|(AccountProxy)|(Factory)|(TestVerifier)|(Paymaster)|(IPaymasterFlow)|(TestPaymasterUtil))$',
      ],
      include: ['abi', 'bytecode', 'factoryDeps'],
    },
  ],
} satisfies HardhatUserConfig;
