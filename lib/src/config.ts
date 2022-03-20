import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const E = process.env;

const __config = {
  deployment: E.DEPLOYMENT?.toLowerCase() === "dev" ? "dev" : "prod",
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
  apiPort: E.PORT || 3001,
  databaseUrl: E.DATABASE_URL,
} as const;

export type Config = typeof __config;

export const CONFIG: Config = __config;

export default CONFIG;

export const IS_DEV = CONFIG.deployment === "dev";
export const IS_PROD = CONFIG.deployment === "prod";
