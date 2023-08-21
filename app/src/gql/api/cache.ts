import {
  Cache,
  CacheExchangeOpts,
  KeyGenerator,
  OptimisticMutationResolver,
  UpdateResolver,
} from '@urql/exchange-graphcache';
import schema from './schema';
import { Node, MutationCreatePolicyArgs, MutationRemovePolicyArgs } from '@api/generated/graphql';
import { gql } from './generated';
import { Address } from 'lib';

export const CACHE_CONFIG: Pick<
  CacheExchangeOpts,
  'resolvers' | 'updates' | 'optimistic' | 'keys'
> = {
  updates: {
    Mutation: {
      createAccount: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['accounts']);
      },
      upsertContact: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['contacts']);
      },
      deleteContact: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'Contact', id: result });
        invalidate(cache, 'Query', ['contacts']);
      },
      pair: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['user', 'accounts']);
      },
      createPolicy: (_result, { input }: MutationCreatePolicyArgs, cache) => {
        invalidate(cache, getAccountEntity(cache, input.account), ['policies']);
      },
      updatePolicy: (result: Node, _args, cache) => {
        invalidate(cache, { __typename: 'Policy', id: result.id }); // Required to update fields not fetched by mutation
      },
      removePolicy: (result: Node, { input }: MutationRemovePolicyArgs, cache) => {
        invalidate(cache, { __typename: 'Policy', id: result.id });
        invalidate(cache, getAccountEntity(cache, input.account), ['policies']);
      },
      proposeTransaction: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['proposals']);
      },
      removeTransaction: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'TransactionProposal', id: result });
        invalidate(cache, 'Query', ['proposals']);
      },
      removeMessage: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'MessageProposal', id: result });
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
    } as /* satisfies */ Partial<Record<Mutation, UpdateResolver<unknown, unknown>>>,
    Subscription: {
      proposal: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['proposals']);
      },
      transfer: (_result, _args, cache) => {
        invalidate(cache, 'Query', ['transfers', 'tokens']);
      },
    } as /* satisfies */ Partial<Record<Subscription, UpdateResolver<unknown, unknown>>>,
  },
  optimistic: {} as /* satisfies */ Partial<Record<Mutation, OptimisticMutationResolver<unknown>>>,
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
type Typename = Type<{ kind: 'OBJECT' | 'INTERFACE' }>['name'];

type QueryType = Type<{ name: Schema['queryType']['name'] }>['fields'][number];
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
  entity: EntityName | { __typename: EntityName; id: string } | undefined,
  fieldnames: Fieldname[] = [],
) {
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

const AccountIdQuery = gql(/* GraphQL */ `
  query Cache_Account($account: Address!) {
    account(input: { address: $account }) {
      id
    }
  }
`);

function getAccountEntity(cache: Cache, account: Address) {
  const id = cache.readQuery({
    query: AccountIdQuery,
    variables: { account },
  })?.account?.id;

  return id ? ({ __typename: 'Account', id } as const) : undefined;
}
