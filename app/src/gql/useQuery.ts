import { DocumentNode, Kind } from 'graphql';
import {
  AnyVariables,
  DocumentInput,
  TypedDocumentNode,
  useQuery as useBaseQuery,
  UseQueryArgs,
  UseQueryExecute,
  UseQueryState,
} from 'urql';

import * as documents from '~/gql/api/documents.generated';
import { logWarning } from '~/util/analytics';

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

  const r = response as QueryResponse<Data, Variables>;
  r.reexecute = reexecute;

  return r;
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

export type DocumentVariables<T extends TypedDocumentNode<any, any>> = T extends TypedDocumentNode<
  infer Result,
  infer Variables
>
  ? Variables
  : never;
