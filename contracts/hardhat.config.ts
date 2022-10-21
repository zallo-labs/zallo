import type { HardhatUserConfig } from 'hardhat/config';
import { CONFIG } from './config';

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
    version: '0.8.17',
  },
  zksolc: {
    // https://github.com/matter-labs/zksolc-bin/tree/main/linux-amd64
    version: '1.2.0',
    compilerSource: 'binary',
  },
  zkSyncDeploy: {
    zkSyncNetwork: CONFIG.chain.zksyncUrl,
    ethNetwork: CONFIG.chain.ethUrl,
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
    apiKey: CONFIG.etherscanApiKey,
  },
  abiExporter: {
    runOnCompile: true,
    path: './abi',
    flat: true,
    clear: true,
    only: [
      ':Account$',
      ':TestAccount$',
      ':ERC1967Proxy$',
      ':Tester$',
      ':Multicall$',
      ':Factory$',
    ],
  },
};

export default config;
