import { PrismaSelect } from '@paljs/plugins';

type SelectParams = ConstructorParameters<typeof PrismaSelect>;

interface Select {
  select: Record<string, unknown>;
}

export const getSelect = (...params: SelectParams): Select | undefined => {
  const v = new PrismaSelect(...params).value;
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
  (info: SelectParams[0]) =>
    getSelect(info, { defaultFields });
