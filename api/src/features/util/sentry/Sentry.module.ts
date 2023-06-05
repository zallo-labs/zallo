import { DynamicModule, Global, Module, OnApplicationShutdown } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { CONFIG } from '~/config';
import { SentryInterceptor } from './sentry.interceptor';

const SHUTDOWN_TIMEOUT = 3_000;

@Global()
@Module({})
export class SentryModule implements OnApplicationShutdown {
  private static initialized = false;

  static forRoot(): DynamicModule {
    SentryModule.init();

    return {
      global: true,
      module: SentryModule,
      providers: [SentryInterceptor],
      exports: [SentryInterceptor],
    };
  }

  async onApplicationShutdown() {
    if (!SentryModule.initialized) return;

    try {
      await Sentry.close(SHUTDOWN_TIMEOUT);
    } catch (e) {
      if (e === false) {
        console.warn('Sentry failed to close in time');
      } else {
        console.error('Sentry failed to close', e);
      }
    }
  }

  private static init() {
    if (SentryModule.initialized) return;

    Sentry.init({
      enabled: CONFIG.env !== 'development',
      dsn: CONFIG.sentryDsn,
      environment: CONFIG.env,
      serverName: CONFIG.serverId,
      sampleRate: 1.0,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection({ mode: 'warn' }),
      ],
      debug: true,
      beforeSend: (e) => {
        console.log('Before send', e);
        return e;
      },
    });
    SentryModule.initialized = true;
  }
}
