import {
  RelayNetworkLayer,
  urlMiddleware,
  loggerMiddleware,
  errorMiddleware,
  perfMiddleware,
  retryMiddleware,
  persistedQueriesMiddleware,
} from 'react-relay-network-modern';
import { PrivateKeyAccount } from 'viem';
import { getAuthMiddleware } from './auth';
import { CONFIG } from '~/util/config';

export async function getRelayNetwork(approver: Promise<PrivateKeyAccount>) {
  return new RelayNetworkLayer(
    [
      // cacheMiddleware({
      //   size: 100, // max 100 requests
      //   ttl: 900000, // 15 minutes
      // }),
      urlMiddleware({
        url: `${CONFIG.apiUrl}/graphql`,
      }),
      __DEV__ ? loggerMiddleware() : null,
      __DEV__ ? errorMiddleware() : null,
      __DEV__ ? perfMiddleware() : null,
      retryMiddleware({
        fetchTimeout: 15000,
        retryDelays: (attempt) => Math.pow(2, attempt + 4) * 100, // or simple array [3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600],
      }),
      persistedQueriesMiddleware({ hash: 'sha256' }),
      await getAuthMiddleware(approver),
      // (next) => (req) => {
      //   const start = new Date().getTime();
    
      //   return next(req).then((res) => {
      //     const end = new Date().getTime();
      //     return res;
      //   });
      // }
    ],
    {},
  );
}
