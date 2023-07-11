import {
  FragmentDefinitionNode,
  GraphQLField,
  GraphQLFieldMap,
  GraphQLObjectTypeExtensions,
  GraphQLOutputType,
  GraphQLResolveInfo,
  InlineFragmentNode,
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
import assert from 'assert';
import e from '~/edgeql-js';
import _ from 'lodash';

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
  edgeql: SomeType;
}

const fieldToShape = (field: FieldDetails, graphqlInfo: GraphQLResolveInfo) => {
  if (!field.selections || field.edgeql.__kind__ !== TypeKind.object) return true;

  // Type may define fields to select
  let shape = {};
  const typeExtensions = getGraphqlTypeExtensions(field.graphql.type);
  if (typeExtensions.select && typeof typeExtensions.select === 'object')
    shape = merge(shape, typeExtensions.select);

  const graphqlFields = getGraphqlTypeFields(field.graphql.type);

  return field.selections.reduce(
    (shape, node) =>
      match(node)
        .with({ kind: Kind.FIELD }, (childNode) => {
          const childName = childNode.name.value;
          if (childName === '__typename') return shape; // Resolved by GraphQL

          const childSchema = graphqlFields[childName];
          if (!childSchema) throw new Error(`Schema for child field not found: ${childName}`);

          // Fields may define fields to select
          const { select } = childSchema.extensions;
          if (select && typeof select === 'object') shape = merge(shape, select);

          // Skip non-edgeql fields e.g. ResolveField
          assert(field.edgeql.__kind__ === TypeKind.object); // Assert for TS; checked above
          const childEqlType: SomeType | undefined = field.edgeql.__pointers__[childName]?.target;
          if (!childEqlType) return shape;

          return {
            ...shape,
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
        .with({ kind: Kind.FRAGMENT_SPREAD }, (fragmentNode) =>
          getFragmentShape(
            field,
            graphqlInfo,
            graphqlInfo.fragments[fragmentNode.name.value],
            shape,
          ),
        )
        .with({ kind: Kind.INLINE_FRAGMENT }, (fragment) =>
          getFragmentShape(field, graphqlInfo, fragment, shape),
        )
        .exhaustive(),
    shape,
  );
};

const getFragmentShape = (
  field: FieldDetails,
  graphqlInfo: GraphQLResolveInfo,
  fragment: FragmentDefinitionNode | InlineFragmentNode,
  shape: any,
) => {
  const fragmentType = fragment.typeCondition?.name.value || undefined;
  const eqlType = (fragmentType &&
    (graphqlInfo.schema.getType(fragmentType)?.extensions.eqlType || e[fragmentType])) as
    | ObjectTypeExpression
    | undefined;

  if (fragmentType && field.graphql.name !== fragmentType && !eqlType)
    throw new Error('No EQL type found for fragment with GraphQL type: ' + fragmentType);

  const fragmentShape = fieldToShape(
    {
      selections: fragment.selectionSet?.selections,
      graphql: field.graphql,
      edgeql: eqlType?.__element__ ?? field.edgeql,
    },
    graphqlInfo,
  );

  // Where there exists duplicate fields (in different fragments), only the last one will be included - https://github.com/edgedb/edgedb-js/issues/630
  return eqlType
    ? {
        ...shape,
        ...e.is(eqlType, fragmentShape),
        ..._.pick(fragmentShape, '__type__') /* __type__ can't be included in e.is() */,
      }
    : merge(shape, fragmentShape);
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

const getGraphqlTypeExtensions = (
  type: GraphQLOutputType,
): Readonly<GraphQLObjectTypeExtensions<unknown, unknown>> =>
  match(type)
    .when(isObjectType, (type) =>
      type
        .getInterfaces()
        .reduce(
          (acc, subType) => ({ ...acc, ...getGraphqlTypeExtensions(subType) }),
          type.extensions,
        ),
    )
    .when(isUnionType, (type) =>
      type
        .getTypes()
        .reduce(
          (acc, subType) => ({ ...acc, ...getGraphqlTypeExtensions(subType) }),
          type.extensions,
        ),
    )
    .with({ ofType: P.not(P.nullish) }, (type) => getGraphqlTypeExtensions(type.ofType))
    .otherwise((type) => type.extensions);
