import session from 'express-session';
import { Duration } from 'luxon';
import CONFIG from 'config';
import { createClient } from 'redis';
import createStore from 'connect-redis';

const RedisStore = createStore(session);

const redisClient = createClient({
  url: CONFIG.redisUrl,
});
redisClient.connect();

export const authSessionRequestHandler = () =>
  session({
    secret: CONFIG.sessionSecret!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: Duration.fromObject({ days: 7 }).toMillis(),
      secure: true,
      sameSite: 'none',
    },
    store: new RedisStore({
      client: redisClient,
    }),
  });
