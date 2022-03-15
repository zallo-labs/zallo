import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { HardhatUserConfig, task } from "hardhat/config";
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
    // ropsten: {
    //   url: process.env.ROPSTEN_URL || "",
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  // Plugins
  typechain: {
    outDir: "typechain",
  },
  gasReporter: {
    // https://github.com/cgewecke/eth-gas-reporter#options
    enabled: false,
    currency: process.env.CURRENCY || "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  // abiExporter: {
  //   path: "./abi",
  //   clear: false,
  //   flat: true,
  // },
};

export default config;
