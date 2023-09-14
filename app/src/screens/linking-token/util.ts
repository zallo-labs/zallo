import constants from 'expo-constants';

const SCHEME = Array.isArray(constants.expoConfig!.scheme)
  ? constants.expoConfig!.scheme[0]
  : constants.expoConfig!.scheme;

export const getLinkingUri = (token: string) => `${SCHEME}://link/${token}`;

const pattern = new RegExp(`^${SCHEME}://link/(.+)$`);
export const getLinkingTokenFromLink = (link: string) => link.match(pattern)?.[1];
