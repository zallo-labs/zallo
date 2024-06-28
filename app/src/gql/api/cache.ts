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
import { Arraylike, UAddress, asUUID, toArray } from 'lib';
import { WritableDeep } from 'ts-toolbelt/out/Object/Writable';
import {
  AccountUpdated,
  Message,
  MutationApproveMessageArgs,
  MutationApproveTransactionArgs,
  MutationProposeMessageArgs,
  MutationProposeTransactionArgs,
  MutationRejectProposalArgs,
  MutationUpdatePolicyArgs,
  PolicyUpdated,
  Proposal,
  ProposalUpdated,
  TokenScreenUpsertMutation,
  Transaction,
  Transfer,
} from './documents.generated';
import type { O } from 'ts-toolbelt';

const optimisticApproveTransactionQuery = gql(/* GraphQL */ `
  query OptimisticApproveTransaction($id: ID!) {
    transaction(input: { id: $id }) {
      id
      approvals {
        __typename
        id
        approver {
          id
          address
        }
        createdAt
      }
      rejections {
        __typename
        approver {
          id
        }
      }
    }

    approver {
      id
      address
    }

    user {
      approvers {
        id
        address
      }
    }
  }
`);

const optimisticApproveMessageQuery = gql(/* GraphQL */ `
  query OptimisticApproveMessage($id: ID!) {
    message(input: { id: $id }) {
      approvals {
        id
        approver {
          id
          address
        }
        createdAt
      }
      rejections {
        approver {
          id
        }
      }
    }

    approver {
      id
      address
    }

    user {
      approvers {
        id
        address
      }
    }
  }
`);

const optimisticRejectProposalQuery = gql(/* GraphQL */ `
  query OptimisticRejectProposal($id: ID!) {
    node(id: $id) {
      __typename
      ... on Proposal {
        approvals {
          id
          approver {
            id
            address
          }
          createdAt
        }
        rejections {
          approver {
            id
          }
        }
      }
    }

    approver {
      id
      address
    }
  }
`);

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
        invalidate(cache, accountEntities(cache, input.account), ['policies', 'proposals']);
      },
      updatePolicy: (result: Node, { input }: MutationUpdatePolicyArgs, cache) => {
        invalidate(cache, { __typename: 'Policy', id: result.id }); // Required to update fields not fetched by mutation\
        invalidate(cache, accountEntities(cache, input.account), ['policies']);
      },
      removePolicy: (result: Node, { input }: MutationRemovePolicyArgs, cache) => {
        invalidate(cache, { __typename: 'Policy', id: result.id });
        invalidate(cache, accountEntities(cache, input.account), ['policies']);
      },
      proposeTransaction: (_result, { input }: MutationProposeTransactionArgs, cache) => {
        invalidate(cache, accountEntities(cache, input.account), ['proposals']);
      },
      removeTransaction: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'Transaction', id: result });
        invalidate(cache, 'Query', ['node', 'policy']);
        invalidate(cache, accountEntities(cache), ['policies', 'proposals']);
      },
      removeMessage: (result: string, _args, cache) => {
        invalidate(cache, { __typename: 'Message', id: result });
        invalidate(cache, accountEntities(cache), ['proposals']);
      },
      proposeMessage: (_result, { input }: MutationProposeMessageArgs, cache) => {
        invalidate(cache, accountEntities(cache, input.account), ['proposals']);
      },
      upsertToken: (result: TokenScreenUpsertMutation, _args, cache) => {
        invalidate(cache, 'Query', ['token', 'tokens']);
        invalidate(cache, { __typename: 'Token', id: result.upsertToken.id });
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
      accountUpdated: ({ accountUpdated: r }: { accountUpdated: AccountUpdated }, _args, cache) => {
        invalidate(cache, { __typename: 'Account', id: r.account?.id });
        if (r.event === 'created') {
          const accounts = cache.resolve('Query', 'todos') ?? [];
          if (Array.isArray(accounts)) cache.link('Query', 'accounts', [...accounts, r.account]);
        }
      },
      policyUpdated: ({ policyUpdated: r }: { policyUpdated: PolicyUpdated }, _args, cache) => {
        invalidate(cache, { __typename: 'Policy', id: r.policy?.id });
        if (r.event === 'created' || r.event === 'removed' || r.event === 'activated')
          invalidate(cache, accountEntities(cache, r.account), ['policies']);
      },
      proposalUpdated: (
        { proposalUpdated: r }: { proposalUpdated: ProposalUpdated },
        _args,
        cache,
      ) => {
        invalidate(cache, { __typename: 'Proposal', id: r.proposal?.id });
        if (r.event === 'create' || r.event === 'delete')
          invalidate(cache, accountEntities(cache, r.account), ['proposals']);
      },
      transfer: ({ transfer: t }: { transfer: Transfer }, _args, cache) => {
        invalidate(cache, { __typename: 'Token', id: t.token?.id }, ['balance', 'spending']);
        invalidate(
          cache,
          t.account.id ? { __typename: 'Account', id: t.account.id } : accountEntities(cache),
          ['transfers'],
        );
      },
    } satisfies Partial<Record<Subscription, UpdateResolver<unknown, unknown>>>,
  },
  optimistic: {
    approveTransaction: (
      { input }: MutationApproveTransactionArgs,
      cache,
    ): O.Partial<Transaction, 'deep'> | null => {
      const data = cache.readQuery({
        query: optimisticApproveTransactionQuery,
        variables: { id: input.id },
      });

      if (!data?.transaction) return null;

      const approver = input.approver
        ? data.user.approvers.find((a) => a.address === input.approver)
        : data.approver;
      if (!approver) return {};

      return {
        __typename: 'Transaction',
        id: input.id,
        approvals: [
          ...data.transaction.approvals,
          {
            __typename: 'Approval',
            id: asUUID(crypto.randomUUID()),
            approver: {
              ...approver,
              __typename: 'Approver',
            },
            createdAt: new Date().toISOString(),
            invalid: false,
            issues: [],
          },
        ],
        rejections: data.transaction.rejections.filter((r) => r.approver.id !== approver.id),
      };
    },
    approveMessage: (
      { input }: MutationApproveMessageArgs,
      cache,
    ): O.Partial<Message, 'deep'> | null => {
      const data = cache.readQuery({
        query: optimisticApproveMessageQuery,
        variables: { id: input.id },
      });

      if (!data?.message) return null;

      const approver = input.approver
        ? data.user.approvers.find((a) => a.address === input.approver)
        : data.approver;
      if (!approver) return {};

      return {
        approvals: [
          ...data.message.approvals,
          {
            __typename: 'Approval',
            id: asUUID(crypto.randomUUID()),
            approver: {
              ...approver,
              __typename: 'Approver',
            },
            createdAt: new Date().toISOString(),
            invalid: false,
            issues: [],
          },
        ],
        rejections: data.message.rejections.filter((r) => r.approver.id !== approver.id),
      };
    },
    rejectProposal: (
      { input }: MutationRejectProposalArgs,
      cache,
    ): O.Partial<Proposal, 'deep'> | null => {
      const data = cache.readQuery({
        query: optimisticRejectProposalQuery,
        variables: { id: input.id },
      });

      const n = data?.node;
      if (!data) return null;
      if (!n || (n.__typename !== 'Transaction' && n.__typename !== 'Message')) return {};

      return {
        approvals: n.approvals.filter((r) => r.approver.id !== data.approver.id),
        rejections: [
          ...n.rejections,
          {
            __typename: 'Rejection',
            id: asUUID(crypto.randomUUID()),
            approver: { ...data.approver, __typename: 'Approver' },
            createdAt: new Date().toISOString(),
          },
        ],
      };
    },
  } satisfies Partial<Record<Mutation, OptimisticMutationResolver<unknown>>>,
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
  Entities extends Type<{ kind: 'OBJECT' | 'INTERFACE' }>,
  EntityName extends Entities['name'],
  Entity extends Extract<Entities, { name: EntityName }>,
  Fieldname extends Entity['fields'][number]['name'],
>(
  cache: Cache,
  entities: Arraylike<EntityName | { __typename: EntityName; id?: string } | undefined>,
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
