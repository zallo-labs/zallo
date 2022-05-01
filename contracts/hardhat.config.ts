import type { HardhatUserConfig } from 'hardhat/config';
import type { Config, Chains } from 'config';
import metanetWallets from './metanet-wallets.json';

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
import 'solidity-coverage';

// Tasks
import './tasks/accounts';
import './tasks/balance';
import './tasks/deposit';

const [CONFIG, CHAINS]: [Config | undefined, Chains | undefined] =
  process.env.NODE_ENV === 'compile'
    ? [undefined, undefined]
    : [require('config').CONFIG, require('config').CHAINS];

// https://hardhat.org/config/
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  zksolc: {
    version: '0.1.0',
    compilerSource: 'docker',
    settings: {
      optimizer: {
        enabled: true,
      },
      compilerPath: undefined as any, // Ignored when using docker compiler
      experimental: {
        dockerImage: 'matterlabs/zksolc',
      },
    },
  },
  zkSyncDeploy: {
    zkSyncNetwork: CONFIG?.chain.zksyncUrl ?? '',
    ethNetwork: CONFIG?.chain.ethUrl ?? '',
  },
  // defaultNetwork: CONFIG?.chain.name ?? 'metanet',
  defaultNetwork: "hardhat",
  networks: {
    // https://hardhat.org/hardhat-network/reference/
    hardhat: {
      zksync: true,
      loggingEnabled: true,
    },
  },
  //   metanet: {
  //     zksync: true,
  //     url: CHAINS?.metanet.zksyncUrl ?? '',
  //     accounts: metanetWallets.map((w) => w.privateKey),
  //   },
  //   testnet: {
  //     zksync: true,
  //     url: CHAINS?.testnet.zksyncUrl ?? '',
  //   },
  // },
  // Plugins
  typechain: {
    outDir: '../lib/src/typechain',
  },
  gasReporter: {
    // https://github.com/cgewecke/eth-gas-reporter#options
    enabled: false,
    currency: 'USD',
    coinmarketcap: CONFIG?.coinmarketcapApiKey,
  },
  etherscan: {
    apiKey: CONFIG?.providers.etherscan,
  },
  abiExporter: {
    runOnCompile: true,
    path: './abi',
    flat: true,
  },
};

export default config;
