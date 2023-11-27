import type { HardhatUserConfig } from 'hardhat/config';
import { CONFIG } from './config';
import { CHAINS } from 'chains';
import type { AbiExporterUserConfig } from 'hardhat-abi-exporter';

import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-viem';
import '@nomiclabs/hardhat-solhint'; // https://github.com/protofire/solhint/blob/master/docs/rules.md
import '@matterlabs/hardhat-zksync-toolbox';
import 'hardhat-gas-reporter';
import 'hardhat-abi-exporter';
import 'hardhat-tracer';
import 'hardhat-contract-sizer';
// import 'solidity-coverage';
// import './test/util/matchers';
import '@solidstate/hardhat-4byte-uploader';

// Tasks
import './tasks/accounts';
import './tasks/balance';
import './tasks/deposit';

const exportConfig = {
  flat: true,
  clear: true,
  runOnCompile: true,
  format: 'typescript',
} satisfies AbiExporterUserConfig;

// https://hardhat.org/config/
export default {
  solidity: {
    version: '0.8.23',
  },
  zksolc: {
    version: '1.3.17',
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
  abiExporter: [
    {
      path: '../packages/lib/src/abi/generated',
      only: [':Account$', ':AccountProxy$', ':Factory$', ':TestVerifier$'],
      ...exportConfig,
    },
    {
      path: './abi',
      only: [':*.test.*$'],
      ...exportConfig,
    },
  ],
  gasReporter: {
    // https://github.com/cgewecke/eth-gas-reporter#options
    enabled: true,
    currency: 'USD',
    coinmarketcap: CONFIG.coinmarketcapApiKey,
  },
} satisfies HardhatUserConfig;
