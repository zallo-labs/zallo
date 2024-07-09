import { Address, Hex } from 'lib';
import { PrivateKeyAccount } from 'viem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '~/util/config';
import { DateTime } from 'luxon';
import { SiweMessage, createSiweMessage } from 'viem/siwe';
import { AuthExchangeOptions } from './network/auth';

type RequestVariables = unknown; // Request variables can be used to identify the request as the object retains its reference
const REQUEST_TOKEN = new Map<RequestVariables, AuthToken>();
export function setRequestAuthToken(variables: RequestVariables, token: AuthToken) {
  REQUEST_TOKEN.set(variables, token);
}

const TOKEN_KEY = 'relay-token';

export interface AuthToken {
  message: string;
  signature: Hex;
  expiration: number;
}

export async function getAuthManager(approver: Promise<PrivateKeyAccount>) {
  let token = await restore();
  let headers = token ? getHeaders(token) : null;

  return {
    getAuthHeaders: () => headers ?? {},
    willAuthError: () => !token || token.expiration <= Date.now(),
    refreshToken: async () => {
      token = await signAuthToken(await approver);
      headers = getHeaders(token);
      AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    },
  } satisfies AuthExchangeOptions;
}

async function restore() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token ? (JSON.parse(token) as AuthToken) : null;
}

export interface CreateTokenApprover {
  address: Address;
  signMessage: (m: { message: string }) => Promise<Hex>;
}

export async function signAuthToken(approver: CreateTokenApprover): Promise<AuthToken> {
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

function getHeaders(token: AuthToken) {
  const json = JSON.stringify({ message: token.message, signature: token.signature });
  return {
    Authorization: `Bearer ${json}`,
  };
}

function willAuthError(token: AuthToken | null) {
  return !token || token.expiration <= Date.now();
}
