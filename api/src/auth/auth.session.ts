import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import session from 'express-session';
import { Duration } from 'luxon';

import CONFIG, { IS_PROD } from 'config';

export const authSessionRequestHandler = () =>
  session({
    secret: CONFIG.sessionSecret!,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: Duration.fromObject({ days: 7 }).toMillis(),
      // Allow cookies created on dev to be used on prod, but not vice-versa
      // ...(IS_PROD && { secure: IS_PROD }),
    },
    store: new PrismaSessionStore(new PrismaClient(), {
      dbRecordIdIsSessionId: true,
      logger: Logger,
      checkPeriod: Duration.fromObject({ hours: 2 }).toMillis(),
    }),
  });
