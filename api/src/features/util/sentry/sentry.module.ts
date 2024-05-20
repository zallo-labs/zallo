import { DynamicModule, Global, Module, OnApplicationShutdown } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { CONFIG } from '~/config';
import { SentryInterceptor } from './sentry.interceptor';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const SHUTDOWN_TIMEOUT = 3_000; // ms

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
    SentryModule.initialized = true;

    Sentry.init({
      enabled: !!CONFIG.sentryDsn,
      dsn: CONFIG.sentryDsn,
      environment: CONFIG.env,
      serverName: CONFIG.serverId,
      sampleRate: 1.0,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0, // Relative to `tracesSampleRate`
      includeLocalVariables: true,
      attachStacktrace: true,
      integrations: [
        // Default integration included
        // Performance tracing integrations included with `tracesSampleRate`
        nodeProfilingIntegration(),
        Sentry.graphqlIntegration
      ],
    });
  }
}
