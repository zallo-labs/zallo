import { Cache, CacheExchangeOpts, UpdateResolver } from '@urql/exchange-graphcache';
import schema from '../schema';

const NO_ID = () => null;

export const CACHE_CONFIG: Pick<
  CacheExchangeOpts,
  'keys' | 'resolvers' | 'updates' | 'optimistic'
> = {
  keys: {
    TokenUnit: NO_ID,
  },
  updates: {
    Mutation: {
      upsertToken: (_result, _args, cache) => {
        invalidateQuery(cache, 'tokens');
      },
      removeToken: (result: string, _args, cache) => {
        cache.invalidate({ __typename: 'Token' as Typename, id: result });
        invalidateQuery(cache, 'tokens');
      },
    } as /* satisfies */ Partial<Record<Mutation, UpdateResolver<unknown, unknown>>>,
  },
};

type Schema = (typeof schema)['__schema'];

type Type<U> = Extract<Schema['types'][number], U>;
type Typename = Type<{ kind: 'OBJECT' }>['name'];

type QueryType = Type<{ name: Schema['queryType']['name'] }>['fields'][number];
type Query = QueryType['name'];

type MutationType = Type<{ name: Schema['mutationType']['name'] }>['fields'][number];
type Mutation = MutationType['name'];

type SubscriptionType = Type<{ name: Schema['subscriptionType']['name'] }>['fields'][number];
type Subscription = SubscriptionType['name'];

function invalidateQuery(cache: Cache, query: Query) {
  cache
    .inspectFields('Query')
    .filter((field) => field.fieldName === query)
    .forEach((field) => cache.invalidate('Query', field.fieldKey));
}
