import {
  CacheConfig,
  Network,
  Observable as RelayObservable,
  RequestParameters,
  Store,
  UploadableMap,
  Variables,
} from 'relay-runtime';
import {
  GraphQLResponseWithData,
  GraphQLResponseWithoutData,
} from 'relay-runtime/lib/network/RelayNetworkTypes';
import { Observable, map, of } from 'rxjs';

export type OperationKind = 'query' | 'mutation' | 'subscription';
export type Operation = Omit<RequestParameters, 'text' | 'operationKind'> & {
  id: string;
  query: string;
  kind: OperationKind;
  variables: Variables;
  cacheConfig: CacheConfig;
  uploadables?: UploadableMap | null;
  fetchOptions: RequestInit;
  context: Record<string, unknown>;
};

export type OperationResult = (GraphQLResponseWithData | GraphQLResponseWithoutData) & {
  operation: Operation;
  response?: Response;
};

interface ExchangeInput {
  forward: ExchangeIO;
}
export type Exchange = (input: ExchangeInput) => ExchangeIO;
type ExchangeIO = (operations$: Observable<Operation>) => Observable<OperationResult>;

export interface NetworkLayerOptions {
  exchanges: Exchange[];
  store: Store;
}

export function createNetworkLayer({ exchanges }: NetworkLayerOptions) {
  const exchangeChain = composeExchanges(exchanges);
  const execute = (operation: Operation) =>
    RelayObservable.from<OperationResult>(exchangeChain(of(operation)));

  return Network.create(
    function fetcher(requestParams, variables, cacheConfig, uploadables) {
      return execute(buildOperation(requestParams, variables, cacheConfig, uploadables));
    },
    function subscriber(requestParams, variables, cacheConfig) {
      return execute(buildOperation(requestParams, variables, cacheConfig));
    },
  );
}

function buildOperation(
  requestParams: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null,
): Operation {
  return {
    ...requestParams,
    id: 'cacheID' in requestParams ? requestParams.cacheID : requestParams.id,
    query: requestParams.text || '',
    kind: requestParams.operationKind as OperationKind,
    variables,
    cacheConfig,
    uploadables,
    fetchOptions: {},
    context: {},
  };
}

function composeExchanges(exchanges: Exchange[]): ExchangeIO {
  return exchanges.reduceRight((forward, exchange) => exchange({ forward }), throwOnRequest);
}

const throwOnRequest: ExchangeIO = (operations$) =>
  operations$.pipe(
    map(() => {
      throw new Error('Last exchange must return a response');
    }),
  );
