import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const E = process.env;

const apiPort = E.API_PORT || E.PORT || 3001;
const apiUrl = E.API_URL || `http://[::1]:${apiPort}`;

const __config = {
  environment: E.NODE_ENV?.toLowerCase() === 'development' ? 'development' : 'production',
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
  databaseUrl: E.DATABASE_URL,
  api: {
    port: apiPort,
    gqlUrl: `${apiUrl}/graphql`,
  },
} as const;

export type Config = typeof __config;

export const CONFIG: Config = __config;

export default CONFIG;

export const IS_DEV = CONFIG.environment === 'development';
export const IS_PROD = CONFIG.environment === 'production';
