import { SiweMessage } from 'siwe';
import 'express-session';

declare global {
  namespace Express {
    interface Request {
      deviceMessage?: SiweMessage;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    nonce: string;
  }
}
