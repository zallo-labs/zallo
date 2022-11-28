import 'express-session';
import { Address } from 'lib';
import { UserContext } from './ctx';

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    nonce: string;
    playgroundWallet?: Address;
  }
}

declare module 'http' {
  interface IncomingHttpHeaders {
    Authorization?: string;
    playground?: string;
  }
}
