import { SiweMessage } from 'siwe';
import 'express-session';

declare global {
  namespace Express {
    interface Request {
      userMessage?: SiweMessage;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    nonce: string;
  }
}