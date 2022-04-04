import { CONFIG } from "config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
// https://github.com/protofire/solhint/blob/master/docs/rules.md
import "@nomiclabs/hardhat-solhint";
import "@typechain/hardhat";

import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-abi-exporter";
import "hardhat-tracer"; // hh test --logs
// import "hardhat-contract-sizer";
// import "hardhat-storage-layout";

// Tasks
import "./tasks/accounts";
import "./tasks/balance";
import "./tasks/deposit";

// Consider plugins
// https://hardhat.org/plugins/hardhat-watcher.html

// https://hardhat.org/config/
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {},
  },
  defaultNetwork: "hardhat",
  networks: {
    // https://hardhat.org/hardhat-network/reference/
    hardhat: {},
    ropsten: {
      url: `https://ropsten.infura.io/v3/${CONFIG.providers.infura}`,
      accounts: CONFIG.wallet.privateKey ? [CONFIG.wallet.privateKey] : [],
    },
  },
  // Plugins
  typechain: {
    outDir: "../lib/src/typechain",
  },
  gasReporter: {
    // https://github.com/cgewecke/eth-gas-reporter#options
    enabled: false,
    currency: "USD",
    coinmarketcap: CONFIG.coinmarketcapApiKey,
  },
  etherscan: {
    apiKey: CONFIG.providers.etherscan,
  },
  abiExporter: {
    runOnCompile: true,
    path: "./abi",
    flat: true,
  },
};

export default config;
