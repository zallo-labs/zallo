import constants from 'expo-constants';

const SCHEME = Array.isArray(constants.expoConfig!.scheme)
  ? constants.expoConfig!.scheme[0]
  : constants.expoConfig!.scheme;

export const getPairingLink = (pairingToken: string) => `${SCHEME}://pair/${pairingToken}`;

const pattern = new RegExp(`^${SCHEME}://pair/(.+)$`);
export const getPairingTokenFromLink = (link: string) => link.match(pattern)?.[1];
