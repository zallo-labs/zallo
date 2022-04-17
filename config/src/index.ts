try {
  require('dotenv').config({ path: '../.env' });
} catch (e) {
  // fs or other such dependency is not available
}

const E = process?.env ?? {};

const required = (key: string) => () => {
  const value = E[key];
  if (value === undefined)
    throw new Error(`ENV '${key}' is required but wasn't found!`);

  return value;
};

const apiPort = E.PORT || 3000;
const apiUrl = E.API_URL ?? `http://[::1]:${apiPort}`;

export const CONFIG = {
  environment:
    E.ENVIRONMENT?.toLowerCase() === 'development'
      ? 'development'
      : 'production',
  chain: E.CHAIN?.toLowerCase() ?? 'ropsten',
  providers: {
    infura: E.INFURA_ID,
    alchemy: E.ALCHEMY_API_KEY,
    etherscan: E.ETHERSCAN_API_KEY,
  },
  coinmarketcapApiKey: E.COINMARKETCAP_API_KEY,
  wallet: {
    address: E.WALLET_ADDRESS,
    privateKey: E.WALLET_PRIVATE_KEY,
  },
  databaseUrl: E.DATABASE_URL,
  api: {
    port: apiPort,
    url: apiUrl,
    gqlUrl: `${apiUrl}/graphql`,
  },
  sessionSecret: required('SESSION_SECRET'),
  subgraphGqlUrl: E.SUBGRAPH_GQL_URL,
  factoryAddress: required('FACTORY_ADDRESS'),
} as const;

export default CONFIG;

export type Config = typeof CONFIG;

export const IS_DEV = CONFIG.environment === 'development';
export const IS_PROD = CONFIG.environment === 'production';
