import {
  GraphQLField,
  GraphQLFieldMap,
  GraphQLOutputType,
  GraphQLResolveInfo,
  Kind,
  SelectionNode,
  isInterfaceType,
  isObjectType,
  isUnionType,
} from 'graphql';
import { P, match } from 'ts-pattern';
import { SelectModifiers, objectTypeToSelectShape } from '~/edgeql-js/select';
import { $scopify, ObjectTypeExpression, ObjectTypeSet, SomeType } from '~/edgeql-js/typesystem';
import { $linkPropify } from '~/edgeql-js/syntax';
import { Cardinality, TypeKind } from 'edgedb/dist/reflection';
import merge from 'ts-deepmerge';

export type Scope<Expr extends ObjectTypeExpression> = $scopify<Expr['__element__']> &
  $linkPropify<{
    [k in keyof Expr]: k extends '__cardinality__' ? Cardinality.One : Expr[k];
  }>;

export type Shape<T extends ObjectTypeSet> = objectTypeToSelectShape<T['__element__']> &
  SelectModifiers<T['__element__']>;

export type ShapeFunc<Expr extends ObjectTypeExpression> = (scope: Scope<Expr>) => Shape<Expr>;

export const getShape =
  <Expr extends ObjectTypeExpression>(info: GraphQLResolveInfo): ShapeFunc<Expr> =>
  (scope): Shape<Expr> => {
    return fieldToShape(
      {
        selections: info.fieldNodes.find((node) => node.name.value === info.fieldName)!.selectionSet
          ?.selections,
        graphql: info.parentType.getFields()[info.fieldName],
        edgeql: scope.__element__,
      },
      info,
    );
  };

interface FieldDetails {
  selections: readonly SelectionNode[] | undefined;
  graphql: GraphQLField<unknown, unknown>;
  edgeql: SomeType | undefined;
}

const fieldToShape = (field: FieldDetails, graphqlInfo: GraphQLResolveInfo) => {
  if (!field.selections) return true;

  const graphqlFields = getGraphqlTypeFields(field.graphql.type);

  return field.selections.reduce(
    (acc, node) =>
      match(node)
        .with({ kind: Kind.FIELD }, (childNode) => {
          const childName = childNode.name.value;
          if (childName === '__typename') return acc; // Resolved by GraphQL

          const childSchema = graphqlFields[childName];
          if (!childSchema) throw new Error(`Schema for child field not found: ${childName}`);

          const { select } = childSchema.extensions;
          if (select && typeof select === 'object') acc = merge(acc, select);

          if (field.edgeql?.__kind__ !== TypeKind.object)
            throw new Error(`Expected EQL field '${field.graphql.name}' type to be an object`);

          // Skip non-edgeql fields e.g. ResolveField
          const childEqlType: SomeType | undefined = field.edgeql.__pointers__[childName]?.target;
          if (!childEqlType) return acc;

          return {
            ...acc,
            [childNode.name.value]: fieldToShape(
              {
                selections: childNode.selectionSet?.selections,
                graphql: childSchema,
                edgeql: childEqlType,
              },
              graphqlInfo,
            ),
          };
        })
        .with({ kind: Kind.FRAGMENT_SPREAD }, (fragmentNode) => {
          const fragment = graphqlInfo.fragments[fragmentNode.name.value];
          // TODO: handle type restriction for EQL types?

          return merge(
            acc,
            fieldToShape(
              {
                selections: fragment.selectionSet?.selections,
                graphql: field.graphql,
                edgeql: field.edgeql,
              },
              graphqlInfo,
            ),
          );
        })
        .with({ kind: Kind.INLINE_FRAGMENT }, (fragment) => {
          // TODO: handle type restriction for EQL types?

          return merge(
            acc,
            fieldToShape(
              {
                selections: fragment.selectionSet?.selections,
                graphql: field.graphql,
                edgeql: field.edgeql,
              },
              graphqlInfo,
            ),
          );
        })
        .exhaustive(),
    {},
  );
};

const getGraphqlTypeFields = (type: GraphQLOutputType): GraphQLFieldMap<unknown, unknown> =>
  match(type)
    .when(isObjectType, (type) => type.getFields())
    .when(isInterfaceType, (type) => type.getFields())
    .when(isUnionType, (type) =>
      type.getTypes().reduce((acc, subType) => ({ ...acc, ...getGraphqlTypeFields(subType) }), {}),
    )
    .with({ ofType: P.not(P.nullish) }, (type) => getGraphqlTypeFields(type.ofType))
    .otherwise(() => ({}));
