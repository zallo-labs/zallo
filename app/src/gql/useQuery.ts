import {
  useQuery as useBaseQuery,
  UseQueryArgs,
  AnyVariables,
  UseQueryState,
  DocumentInput,
} from 'urql';

type Options<Data, Variables extends AnyVariables> = Omit<
  UseQueryArgs<Variables, Data>,
  'query' | 'variables'
>;

type OptionalVariables = undefined | Record<string, never>;

export function useQuery<Data, Variables extends AnyVariables>(
  // Check whether the variables are optional
  ...[query, variables, options]: Variables extends OptionalVariables
    ? [
        query: DocumentInput<Data, Variables>,
        variables?: Variables,
        options?: Options<Data, Variables>,
      ]
    : [
        query: DocumentInput<Data, Variables>,
        variables: Variables,
        options?: Options<Data, Variables>,
      ]
) {
  return useBaseQuery({ ...options, query, variables: variables! })[0] as Omit<
    UseQueryState<Data, Variables>,
    'data'
  > & {
    data: Data;
  };
}
