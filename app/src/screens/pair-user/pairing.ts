import { MANIFEST } from '~/util/config';

export const getPairingLink = (pairingToken: string) => `${MANIFEST.scheme}://pair/${pairingToken}`;

const pattern = new RegExp(`^${MANIFEST.scheme}://pair/(.+)$`);
export const getPairingTokenFromLink = (link: string) => link.match(pattern)?.[1];
