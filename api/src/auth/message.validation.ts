import { Request } from 'express';
import { SiweMessage, ErrorTypes } from 'siwe';
import { DateTime } from 'luxon';
import { MaybePromise } from 'lib';

const validateErrors: Record<ErrorTypes, string> = {
  [ErrorTypes.INVALID_SIGNATURE]: 'Message has invalid signature',
  [ErrorTypes.EXPIRED_MESSAGE]: 'Message has expired',
  [ErrorTypes.MALFORMED_SESSION]: 'Message is missing required fields',
};

type IsErrorCheck = (params: {
  msg: SiweMessage;
  sig: string;
  req: Request;
}) => MaybePromise<boolean | string>;

export const VALIDATION_CHECKS: Record<string, IsErrorCheck> = {
  'Session lacking nonce': ({ req }) => req.session.nonce === undefined,
  'Message failed to validate': async ({ msg, sig }) => {
    try {
      return !(await msg.validate(sig));
    } catch (e) {
      return validateErrors[e as ErrorTypes] ?? true;
    }
  },
  "Message nonce doesn't match session nonce": ({ msg, req }) =>
    msg.nonce !== req.session.nonce,
  'Message not yet valid': ({ msg }) =>
    msg.notBefore !== undefined &&
    DateTime.fromISO(msg.notBefore) > DateTime.now(),
};
