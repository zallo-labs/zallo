import { PrismaSelect } from '@paljs/plugins';
import { GraphQLResolveInfo } from 'graphql';

type SelectParams = ConstructorParameters<typeof PrismaSelect>;

interface Select {
  select: Record<string, unknown>;
}

export const getSelect = (
  info: GraphQLResolveInfo | undefined,
  options?: SelectParams[1],
): Select | undefined => {
  if (!info) return undefined;

  const v = new PrismaSelect(info, options).value;
  return v && Object.keys(v.select).length ? v : undefined;
};

type DefaultFields = {
  [key: string]:
    | {
        [key: string]: boolean | any;
      }
    | ((select: any) => {
        [key: string]: boolean | any;
      });
};

export const makeGetSelect =
  <F extends DefaultFields>(defaultFields: F) =>
  (info: GraphQLResolveInfo | undefined) =>
    getSelect(info, { defaultFields });
