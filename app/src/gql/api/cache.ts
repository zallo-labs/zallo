import {
  Cache,
  CacheExchangeOpts,
  KeyGenerator,
  OptimisticMutationResolver,
  UpdateResolver,
} from '@urql/exchange-graphcache';
import schema from './schema.generated';
import { Node, MutationCreatePolicyArgs, MutationRemovePolicyArgs } from '@api/generated/graphql';
import { gql } from './generated';
import { Arraylike, UAddress, toArray } from 'lib';
import { WritableDeep } from 'ts-toolbelt/out/Object/Writable';
import { ProposalUpdated } from './documents.generated';

export const CACHE_SCHEMA_CONFIG: Pick<
  CacheExchangeOpts,
  'schema' | 'resolvers' | 'updates' | 'optimistic' | 'keys'
> = {
  schema,
  updates: {
    Mutation: {
      createAccount: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['accounts']);
      },
      upsertContact: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['contacts', 'label']);
      },
      deleteContact: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'Contact', id: result });
        invalidate(cache, 'Query', ['contacts']);
      },
      link: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['user', 'accounts']);
      },
      createPolicy: (_result, { input }: MutationCreatePolicyArgs, cache) => {
        invalidate(cache, accountEntities(cache, input.account), ['policies']);
      },
      updatePolicy: (result: Node, _args, cache) => {
        invalidate(cache, { __typename: 'Policy', id: result.id }); // Required to update fields not fetched by mutation
      },
      removePolicy: (result: Node, { input }: MutationRemovePolicyArgs, cache) => {
        invalidate(cache, { __typename: 'Policy', id: result.id });
        invalidate(cache, accountEntities(cache, input.account), ['policies']);
      },
      proposeTransaction: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['proposals']);
      },
      removeTransaction: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'Transaction', id: result });
        invalidate(cache, 'Query', ['proposals', 'policy', 'policyState', 'policies']);
        invalidate(cache, accountEntities(cache), ['policies']);
      },
      removeMessage: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'Message', id: result });
        invalidate(cache, 'Query', ['proposals']);
      },
      proposeMessage: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['proposals']);
      },
      upsertToken: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['tokens']);
      },
      removeToken: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'Token', id: result });
        invalidate(cache, 'Query', ['tokens']);
      },
      requestTokens: (_result: string, _args, cache) => {
        invalidate(cache, 'Query', ['requestableTokens']);
      },
    } as Partial<Record<Mutation, UpdateResolver<unknown, unknown>>>,
    Subscription: {
      proposalUpdated: (
        { proposalUpdated: r }: { proposalUpdated: Partial<ProposalUpdated> },
        _args,
        cache,
      ) => {
        if (r.event === 'create' || r.event === 'delete') invalidate(cache, 'Query', ['proposals']);
        if (r.event === 'executed' || r.event === 'delete') {
          invalidate(cache, 'Query', ['policy', 'policyState', 'policies']);
          invalidate(cache, accountEntities(cache, r.account), ['policies']);
        }
      },
      transfer: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['transfers', 'tokens']);
      },
    } satisfies Partial<Record<Subscription, UpdateResolver<unknown, unknown>>>,
  },
  optimistic: {} satisfies Partial<Record<Mutation, OptimisticMutationResolver<unknown>>>,
  keys: new Proxy<Partial<Record<Typename, KeyGenerator>>>(
    {
      // Explicit keys
    } satisfies Partial<Record<Typename, KeyGenerator>>,
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
            if (
              type?.kind === 'OBJECT' &&
              (type.fields as unknown as WritableDeep<(typeof type.fields)[0]>[]).find(
                (f) => f.name === 'id',
              )
            ) {
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
type Typename = Type<{ kind: 'OBJECT' | 'INTERFACE' }>['name'];

type QueryType = Type<{ name: Schema['queryType']['name'] }>['fields'][number];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Query = QueryType['name'];

type MutationType = Type<{ name: Schema['mutationType']['name'] }>['fields'][number];
type Mutation = MutationType['name'];

type SubscriptionType = Type<{ name: Schema['subscriptionType']['name'] }>['fields'][number];
type Subscription = SubscriptionType['name'];

function invalidate<
  Entity extends Type<{ kind: 'OBJECT' | 'INTERFACE' }>,
  EntityName extends Entity['name'],
  Fieldname extends Entity['fields'][number]['name'],
>(
  cache: Cache,
  entities: Arraylike<EntityName | { __typename: EntityName; id: string } | undefined>,
  fieldnames: Fieldname[] = [],
) {
  for (const entity of toArray(entities)) {
    const key = entity && cache.keyOfEntity(entity);
    if (!key) return;

    if (fieldnames.length) {
      cache
        .inspectFields(key)
        .filter((field) => fieldnames.includes(field.fieldName as Fieldname))
        .forEach((field) => cache.invalidate(key, field.fieldKey));
    } else {
      // Invalidate entire entity
      cache.invalidate(key);
    }
  }
}

const AccountsQuery = gql(/* GraphQL */ `
  query Cache_Accounts {
    accounts {
      id
      address
    }
  }
`);

function accountEntities(cache: Cache, account?: UAddress) {
  return (
    cache
      .readQuery({ query: AccountsQuery })
      ?.accounts.filter((a) => !account || a.address === account)
      .map((a) => ({ __typename: 'Account', id: a.id }) as const) ?? []
  );
}
