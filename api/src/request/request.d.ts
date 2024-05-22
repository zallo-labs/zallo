import 'express-session';
import { Address } from 'lib';
import { UserContext } from '#/util/context';

declare module 'express-session' {
  interface SessionData {
    nonce: string;
    playgroundWallet?: Address;
    accounts: Address[];
  }
}

declare module 'http' {
  interface IncomingHttpHeaders {
    authorization?: string;
    playground?: string;
  }
}
