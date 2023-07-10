import type { HardhatUserConfig } from 'hardhat/config';
import { CONFIG } from './config';

import '@nomiclabs/hardhat-ethers';
// import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-solhint'; // https://github.com/protofire/solhint/blob/master/docs/rules.md
import '@matterlabs/hardhat-zksync-verify';
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

// https://github.com/matter-labs/zksolc-bin/tree/main/linux-amd64
const ZKSYNC_COMPILER_VERSION = '1.3.13';

// https://hardhat.org/config/
export default {
  solidity: {
    version: '0.8.20',
  },
  zksolc: {
    version: ZKSYNC_COMPILER_VERSION,
    compilerSource: 'binary',
    settings: {
      compilerPath: `./zksolc-linux-amd64-musl-v${ZKSYNC_COMPILER_VERSION}`,
      isSystem: true,
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
          ethNetwork: chain.layer1.rpcUrls.default.http[0],
          verifyURL: chain.verifyUrl,
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
    enabled: true,
    currency: 'USD',
    coinmarketcap: CONFIG.coinmarketcapApiKey,
  },
  etherscan: {
    apiKey: CONFIG.etherscanApiKey,
  },
  abiExporter: {
    path: './abi',
    only: [':Account$', ':AccountProxy$', ':Factory$', ':*.test.*$'],
    flat: true,
    clear: true,
    runOnCompile: true,
  },
} satisfies HardhatUserConfig;
