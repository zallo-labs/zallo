import {
  useQuery as useBaseQuery,
  UseQueryArgs,
  AnyVariables,
  UseQueryState,
  DocumentInput,
  UseQueryExecute,
  TypedDocumentNode,
} from 'urql';
import { DocumentNode, Kind } from 'graphql';
import * as documents from '~/gql/api/documents.generated';
import { logWarning } from '~/util/analytics';
import { usePrevious } from '~/hooks/usePrevious';
import _ from 'lodash';

type Options<Data, Variables extends AnyVariables> = Omit<
  UseQueryArgs<Variables, Data>,
  'query' | 'variables'
>;

type OptionalVariables = undefined | Record<string, never>;

type QueryResponse<Data, Variables extends AnyVariables> = Omit<
  UseQueryState<Data, Variables>,
  'data'
> & { data: Data; reexecute: UseQueryExecute };

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
  const [response, reexecute] = useBaseQuery({
    ...options,
    query: getOptimizedDocument(query),
    variables: variables!,
  });

  const previousData = usePrevious(response.data);
  const data =
    (!response.data && response.stale && previousData ? previousData : response.data) ?? {};

  if ((!response.data || _.isEmpty(response.data)) && response.stale)
    console.log({ data, previousData });

  return {
    ...response,
    data,
    reexecute,
  } as QueryResponse<Data, Variables>;
}

const CACHED_REPLACEMENTS = new Map<DocumentInput<unknown, unknown>, DocumentNode | null>();

export function getOptimizedDocument<Data, Variables>(
  doc: DocumentInput<Data, Variables>,
): DocumentInput<Data, Variables> {
  // Replace document with Relay compiler optimized version (from api/generated)
  const cachedMatch = CACHED_REPLACEMENTS.get(doc);
  if (cachedMatch) return cachedMatch;
  if (cachedMatch === null) return doc;

  if (typeof doc === 'object' && doc?.definitions && doc.definitions.length >= 1) {
    const def = doc.definitions[0];

    if (def.kind === Kind.OPERATION_DEFINITION && def.name) {
      const matchingDocument = documents[`${def.name.value}Document` as keyof typeof documents];
      if (typeof matchingDocument === 'object') {
        CACHED_REPLACEMENTS.set(doc, matchingDocument);
        return matchingDocument;
      }
    }
  }

  logWarning('No matching optimized document found', { doc });

  CACHED_REPLACEMENTS.set(doc, null);
  return doc;
}

export type DocumentVariables<T extends TypedDocumentNode<any, any>> =
  T extends TypedDocumentNode<infer _Result, infer Variables> ? Variables : never;
