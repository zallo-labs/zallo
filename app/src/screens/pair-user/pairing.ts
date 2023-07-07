import { MANIFEST } from '~/util/config';

export const getPairingLink = (pairingToken: string) => `${MANIFEST.scheme}://pair/${pairingToken}`;

const pattern = new RegExp(`^${MANIFEST.scheme}://pair/(.+)$`);
export const getPairingTokenFromLink = (link: string) => {
  const match = link.match(pattern);
  return match ? match[1] : null;
};
