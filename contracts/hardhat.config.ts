import type { HardhatUserConfig } from 'hardhat/config';
import { CONFIG } from 'config';

import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
// https://github.com/protofire/solhint/blob/master/docs/rules.md
import '@nomiclabs/hardhat-solhint';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'hardhat-abi-exporter';
import 'hardhat-tracer';
// import 'solidity-coverage';

// Tasks
import './tasks/accounts';
import './tasks/balance';
import './tasks/deposit';

// https://hardhat.org/config/
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.13',
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  zksolc: {
    version: '0.1.0',
    compilerSource:
      CONFIG.isDocker || CONFIG.useZksolcBin ? 'binary' : 'docker',
    settings: {
      optimizer: {
        enabled: true,
      },
      compilerPath: 'zksolc', // only used for compilerSource=binary
      experimental: {
        dockerImage: 'matterlabs/zksolc',
      },
    },
  },
  zkSyncDeploy: {
    zkSyncNetwork: CONFIG.chain?.zksyncUrl ?? '',
    ethNetwork: CONFIG.chain?.ethUrl ?? '',
  },
  defaultNetwork: 'hardhat',
  networks: {
    // https://hardhat.org/hardhat-network/reference/
    hardhat: {
      zksync: true,
      loggingEnabled: true,
    },
  },
  // Plugins
  typechain: {
    outDir: '../lib/src/contracts',
    target: 'ethers-v5',
  },
  gasReporter: {
    // https://github.com/cgewecke/eth-gas-reporter#options
    enabled: false,
    currency: 'USD',
    coinmarketcap: CONFIG.coinmarketcapApiKey,
  },
  etherscan: {
    apiKey: CONFIG.providers?.etherscan,
  },
  abiExporter: {
    runOnCompile: true,
    path: './abi',
    flat: true,
  },
};

export default config;
