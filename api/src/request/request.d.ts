import 'express-session';
import { Address } from 'lib';

declare global {
  namespace Express {
    interface Request {
      device?: Address;
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
    playground?: string;
  }
}
