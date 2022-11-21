import type { SiweMessage } from 'siwe';

export interface AuthToken {
  message: SiweMessage;
  signature: string;
}
