import { Cache, CacheExchangeOpts, UpdateResolver } from '@urql/exchange-graphcache';
import schema from './schema';
import { MutationCreatePolicyArgs, Node } from '@api/generated/graphql';
import { gql } from './generated';

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
      createAccount: (_result, _args, cache) => {
        invalidateQuery(cache, 'accounts');
      },
      upsertContact: (_result, _args, cache) => {
        invalidateQuery(cache, 'contacts');
      },
      deleteContact: (result: string, _args, cache) => {
        cache.invalidate({ __typename: 'Contact' as Typename, id: result });
        invalidateQuery(cache, 'contacts');
      },
      pair: (_result, _args, cache) => {
        invalidateQuery(cache, 'accounts');
      },
      createPolicy: (_result, { input }: MutationCreatePolicyArgs, cache) => {
        // Invalidate account
        const r = cache.readQuery({
          query: gql(/* GraphQL */ `
            query Account($account: Address!) {
              account(input: { address: $account }) {
                id
              }
            }
          `),
          variables: { account: input.account },
        });

        if (r?.account) cache.invalidate({ __typename: 'Account' as Typename, id: r.account.id });
      },
      removePolicy: (result: Node, _args, cache) => {
        cache.invalidate({ __typename: 'Policy' as Typename, id: result.id });
        invalidateQuery(cache, 'policies');
      },
      propose: (_result, _args, cache) => {
        invalidateQuery(cache, 'proposals');
      },
      removeProposal: (result: string, _args, cache) => {
        cache.invalidate({ __typename: 'Proposal' as Typename, id: result });
        invalidateQuery(cache, 'proposals');
      },
      upsertToken: (_result, _args, cache) => {
        invalidateQuery(cache, 'tokens');
      },
      removeToken: (result: string, _args, cache) => {
        cache.invalidate({ __typename: 'Token' as Typename, id: result });
        invalidateQuery(cache, 'tokens');
      },
      requestTokens: (_result: string, _args, cache) => {
        invalidateQuery(cache, 'requestableTokens');
      },
    } as /* satisfies */ Partial<Record<Mutation, UpdateResolver<unknown, unknown>>>,
    Subscription: {
      proposal: (_result, _args, cache) => {
        invalidateQuery(cache, 'proposals');
      },
      transfer: (_result, _args, cache) => {
        invalidateQuery(cache, 'transfers');
      },
    } as /* satisfies */ Partial<Record<Subscription, UpdateResolver<unknown, unknown>>>,
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
