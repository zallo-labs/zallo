import { ApolloCache, DataProxy } from '@apollo/client';
import produce, { Draft } from 'immer';
import { Nothing } from 'immer/dist/utils/env';

export type QueryOpts<TVariables> = DataProxy.Query<TVariables, unknown>;

type ValidRecipeReturnType<State> =
  | State
  | void
  | undefined
  | (State extends undefined ? Nothing : never);
type UpdaterReturn<State> =
  | ValidRecipeReturnType<State>
  | Promise<ValidRecipeReturnType<State>>;

type Query<Data, Variables> = Omit<DataProxy.Query<Variables, Data>, 'id'>;

interface UpdateQueryOptions<Data, Variables> extends Query<Data, Variables> {
  cache: ApolloCache<unknown>;
  updater: (
    draft: Draft<NonNullable<Data>>,
  ) => UpdaterReturn<Draft<NonNullable<Data>>>;
  defaultData?: Data;
}

export const updateQuery = async <Data, Variables>({
  cache,
  query,
  variables,
  updater,
  defaultData,
}: UpdateQueryOptions<Data, Variables>) => {
  const data =
    cache.readQuery<Data, Variables>({
      query,
      variables,
    }) ?? defaultData;

  if (data) {
    cache.writeQuery<Data, Variables>({
      query,
      variables,
      overwrite: true,
      data: await produce(data, async (x) => await updater(x)),
    });
  }
};
