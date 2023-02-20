import type { HardhatUserConfig } from 'hardhat/config';
import { CONFIG } from './config';

import '@nomiclabs/hardhat-ethers';
// import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-solhint'; // https://github.com/protofire/solhint/blob/master/docs/rules.md
import '@matterlabs/hardhat-zksync-toolbox';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'hardhat-abi-exporter';
import 'hardhat-tracer';
import 'hardhat-contract-sizer';
// import 'solidity-coverage';

// Tasks
import './tasks/accounts';
import './tasks/balance';
import './tasks/deposit';
import { CHAINS } from 'lib';

// https://hardhat.org/config/
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
  },
  zksolc: {
    // https://github.com/matter-labs/zksolc-bin/tree/main/linux-amd64
    version: '1.3.5',
    compilerSource: 'binary',
    settings: {
      isSystem: true,
    },
  },
  defaultNetwork: CONFIG.chain.name,
  networks: {
    // https://hardhat.org/hardhat-network/reference/
    hardhat: { zksync: true },

    ...Object.fromEntries(
      Object.values(CHAINS).map((chain) => [
        chain.name,
        {
          url: chain.rpc,
          ethNetwork: chain.l1Rpc,
          zksync: true,
        },
      ]),
    ),
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
    only: [':Account$', ':TestAccount$', ':ERC1967Proxy$', ':Tester$', ':Multicall$', ':Factory$'],
  },
};

export default config;
