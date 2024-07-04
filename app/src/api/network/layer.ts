import {
  CacheConfig,
  Network,
  Observable as RelayObservable,
  RequestParameters,
  Store,
  UploadableMap,
  Variables,
  FetchFunction,
  GraphQLSingularResponse,
  PayloadData,
  PayloadError,
} from 'relay-runtime';
import {
  GraphQLResponseWithData,
  GraphQLResponseWithoutData,
  PayloadExtensions,
} from 'relay-runtime/lib/network/RelayNetworkTypes';
import { Observable, map, of } from 'rxjs';

export type OperationKind = 'query' | 'mutation' | 'subscription';
export interface OperationRequest {
  kind: OperationKind;
  operation: RequestParameters;
  variables: Variables;
  cacheConfig: CacheConfig;
  uploadables?: UploadableMap | null;
  fetchOptions: RequestInit;
}

export type OperationResult = (GraphQLResponseWithData | GraphQLResponseWithoutData) & {
  request: OperationRequest;
  response?: Response;
};

interface ExchangeInput {
  forward: ExchangeIO;
}
export type Exchange = (input: ExchangeInput) => ExchangeIO;
type ExchangeIO = (operations$: Observable<OperationRequest>) => Observable<OperationResult>;

export interface NetworkLayerOptions {
  exchanges: Exchange[];
  store: Store;
}

export function createNetworkLayer({ exchanges }: NetworkLayerOptions) {
  const exchangeChain = composeExchanges(exchanges);

  const execute = (request: OperationRequest) =>
    RelayObservable.from<OperationResult>(exchangeChain(of(request)));

  return Network.create(
    (operation, variables, cacheConfig, uploadables) => {
      return execute(buildRequest(operation, variables, cacheConfig, uploadables));
    },
    (operation, variables, cacheConfig) => {
      return execute(buildRequest(operation, variables, cacheConfig));
    },
  );
}

function buildRequest(
  operation: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null,
): OperationRequest {
  return {
    kind: operation.operationKind as OperationKind,
    operation,
    variables,
    cacheConfig,
    uploadables,
    fetchOptions: {},
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
