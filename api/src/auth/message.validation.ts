import { Request } from 'express';
import { SiweMessage } from 'siwe';
import { DateTime } from 'luxon';
import { MaybePromise } from 'lib';
import { ethers } from 'ethers';

type IsErrorCheck = (params: {
  msg: SiweMessage;
  sig: string;
  req: Request;
  provider: ethers.providers.Provider;
}) => MaybePromise<boolean | string>;

export const VALIDATION_CHECKS: Record<string, IsErrorCheck> = {
  'Session lacking nonce': ({ req }) => req.session.nonce === undefined,
  'Message verification failed': async ({ msg, sig, provider, req }) => {
    const r = await msg.verify(
      {
        signature: sig,
        domain: new URL(req.hostname).host,
        nonce: req.session.nonce,
        time: DateTime.now().toISO(),
      },
      { provider },
    );

    return r.error?.type || false;
  },
};
