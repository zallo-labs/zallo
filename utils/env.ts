import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });
// require("dotenv").config({ path: "../.env" });

const E = process.env;

export const ENV = {
  infura: {
    id: E.INFURA_ID,
    secret: E.INFURA_secret,
  },
  alchemyApiKey: E.ALCHEMY_API_KEY,
  etherscanApiKey: E.ETHERSCAN_API_KEY,
  coinmarketcapApiKey: E.COINMARKETCAP_API_KEY,
  wallet: {
    address: E.WALLET_ADDRESS,
    privateKey: E.WALLET_PRIVATE_KEY,
  },
  apiPort: E.API_PORT || 3001,
  databaseUrl: E.DATABASE_URL,
};

export default ENV;
