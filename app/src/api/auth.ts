import { Address, Hex } from 'lib';
import { PrivateKeyAccount } from 'viem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '~/util/config';
import { DateTime } from 'luxon';
import { SiweMessage, createSiweMessage } from 'viem/siwe';
import { authMiddleware } from 'react-relay-network-modern';

const TOKEN_KEY = 'relay-token';

interface Token {
  message: string;
  signature: Hex;
  expiration: number;
}

export async function getAuthMiddleware(approver: Promise<PrivateKeyAccount>) {
  let token = await restore();
  let authorization: string | null;

  async function refresh() {
    token = await createToken(await approver);
    authorization = getAuthorization(token);
    AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    return authorization;
  }

  return authMiddleware({
    header: 'Authorization',
    prefix: 'Bearer ',
    token: () => {
      if (!token || isInvalidToken(token)) return refresh();
      return authorization!;
    },
    tokenRefreshPromise: refresh,
  });
}

async function restore() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token ? (JSON.parse(token) as Token) : null;
}

interface CreateTokenApprover {
  address: Address;
  signMessage: (m: { message: string }) => Promise<Hex>;
}

async function createToken(approver: CreateTokenApprover): Promise<Token> {
  // Cookies are problematic on RN - https://github.com/facebook/react-native/issues/23185
  // const nonce = await (await fetch(`${CONFIG.apiUrl}/auth/nonce`, { credentials: 'include' })).text();
  const nonce = 'nonceless';

  const fields = {
    address: approver.address,
    chainId: 0,
    domain: new URL(CONFIG.apiUrl).host,
    nonce,
    uri: CONFIG.webAppUrl, // Required but unused by api
    version: '1',
    expirationTime: DateTime.now().plus({ days: 2 }).toJSDate(),
  } satisfies SiweMessage;

  const message = createSiweMessage(fields);
  const signature = await approver.signMessage({ message });
  const expiration = fields.expirationTime.getTime();
  return { message, signature, expiration };
}

function getAuthorization(token: Token) {
  return JSON.stringify({
    message: token.message,
    signature: token.signature,
  });
}

function isInvalidToken(token: Token) {
  return token.expiration <= Date.now();
}
