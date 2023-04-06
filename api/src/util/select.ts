import { PrismaSelect } from '@paljs/plugins';
import { Prisma } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';
import _ from 'lodash';

type ModelSelect<M extends Prisma.ModelName> =
  Prisma.TypeMap['model'][M]['findUnique']['args']['select'];

type DefaultFields = Partial<{
  [K in Prisma.ModelName]: ModelSelect<K> | ((select: any) => ModelSelect<K>);
}>;

const DEFAULT_FIELDS: DefaultFields = {
  Approver: (select) => ({
    ...(select.id && {
      stateId: true,
      userId: true,
    }),
  }),
  Contact: (select) => ({
    ...(select.id && {
      addr: true,
    }),
  }),
  ContractMethod: (select) => ({
    ...(select.id && {
      contract: true,
      sighash: true,
    }),
  }),
  Proposal: (select) => ({
    ...(select.transaction && {
      transactions: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: _.omit(select.transaction.select, ['id']) ?? true,
      },
    }),
    ...((select.approvals || select.rejections) && {
      approvals: true,
    }),
  }),
  Policy: (select) => ({
    ...(select.id && {
      accountId: true,
      key: true,
    }),
  }),
  Reaction: (select) => ({
    ...(select.id && {
      commentId: true,
      userId: true,
    }),
  }),
  Transaction: (select) => ({
    ...(select.id && {
      hash: true,
    }),
  }),
};

interface Select {
  select: Record<string, unknown>;
}

export const getSelect = (
  info: GraphQLResolveInfo | undefined,
  options?: Omit<ConstructorParameters<typeof PrismaSelect>[1], 'defaultFields'>,
): Select | undefined => {
  if (!info) return undefined;

  const v = new PrismaSelect(info, {
    ...options,
    defaultFields: DEFAULT_FIELDS as any,
  }).value;

  return v && Object.keys(v.select).length ? v : undefined;
};
