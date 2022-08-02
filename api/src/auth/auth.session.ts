import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import session from 'express-session';
import { Duration } from 'luxon';
import CONFIG from 'config';

export const authSessionRequestHandler = () =>
  session({
    secret: CONFIG.sessionSecret!,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: Duration.fromObject({ days: 7 }).toMillis(),
      secure: true,
      sameSite: 'none',
    },
    store: new PrismaSessionStore(new PrismaClient(), {
      dbRecordIdIsSessionId: true,
      logger: Logger,
      checkPeriod: Duration.fromObject({ hours: 2 }).toMillis(),
    }),
  });
