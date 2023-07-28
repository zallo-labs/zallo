import { Cache, CacheExchangeOpts, KeyGenerator, UpdateResolver } from '@urql/exchange-graphcache';
import schema from './schema';
import { MutationCreatePolicyArgs, Node } from '@api/generated/graphql';
import { gql } from './generated';

export const CACHE_CONFIG: Pick<
  CacheExchangeOpts,
  'resolvers' | 'updates' | 'optimistic' | 'keys'
> = {
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
        invalidateQuery(cache, 'transfers', 'tokens');
      },
    } as /* satisfies */ Partial<Record<Subscription, UpdateResolver<unknown, unknown>>>,
  },
  keys: new Proxy(
    {
      // Explicit keys
    } as /* satisfies */ Partial<Record<Typename, KeyGenerator>>,
    {
      get: (target, p) => {
        const explicit = target[p as Typename];
        if (explicit) return explicit;

        return (data: Record<string, unknown>) => {
          if ('id' in data) return data.id;

          // Show an error for types that have an id field, but isn't selected
          if (__DEV__ && !KEY_TYPENAME_CHECKED[p]) {
            KEY_TYPENAME_CHECKED[p] = true;
            const type = schema['__schema']['types'].find((t) => t.name === p);
            if (type?.kind === 'OBJECT' && (type.fields as any).find((f: any) => f.name === 'id')) {
              console.error(
                `Type '${p.toString()}' has a selection set but no key could be generated. Specify 'id' in the selection set or add an explicit key function for this type`,
              );
            }
          }

          return null;
        };
      },
    },
  ),
};

const KEY_TYPENAME_CHECKED: Record<string | symbol, true> = {};

type Schema = (typeof schema)['__schema'];

type Type<U> = Extract<Schema['types'][number], U>;
type Typename = Type<{ kind: 'OBJECT' }>['name'];

type QueryType = Type<{ name: Schema['queryType']['name'] }>['fields'][number];
type Query = QueryType['name'];

type MutationType = Type<{ name: Schema['mutationType']['name'] }>['fields'][number];
type Mutation = MutationType['name'];

type SubscriptionType = Type<{ name: Schema['subscriptionType']['name'] }>['fields'][number];
type Subscription = SubscriptionType['name'];

function invalidateQuery(cache: Cache, ...queries: Query[]) {
  cache
    .inspectFields('Query')
    .filter((field) => queries.includes(field.fieldName as Query))
    .forEach((field) => cache.invalidate('Query', field.fieldKey));
}
