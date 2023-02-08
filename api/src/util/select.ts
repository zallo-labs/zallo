import { PrismaSelect } from '@paljs/plugins';
import { Prisma } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';

type ModelSelect<M extends Prisma.ModelName> =
  Prisma.TypeMap['model'][M]['findUnique']['args']['select'];

type DefaultFields = Partial<{
  [K in Prisma.ModelName]: ModelSelect<K> | ((select: any) => ModelSelect<K>);
}>;

type Options = Omit<ConstructorParameters<typeof PrismaSelect>[1], 'defaultFields'> & {
  defaultFields: DefaultFields;
};

interface Select {
  select: Record<string, unknown>;
}

export const getSelect = (
  info: GraphQLResolveInfo | undefined,
  options?: Options,
): Select | undefined => {
  if (!info) return undefined;

  const v = new PrismaSelect(info, options as any).value;
  return v && Object.keys(v.select).length ? v : undefined;
};

export const makeGetSelect =
  (defaultFields: DefaultFields) => (info: GraphQLResolveInfo | undefined) =>
    getSelect(info, { defaultFields });
