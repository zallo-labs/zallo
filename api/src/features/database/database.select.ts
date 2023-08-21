import {
  FragmentDefinitionNode,
  GraphQLEnumType,
  GraphQLField,
  GraphQLFieldMap,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLObjectTypeExtensions,
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLUnionType,
  InlineFragmentNode,
  Kind,
  SelectionNode,
  isEnumType,
  isInterfaceType,
  isObjectType,
  isOutputType,
  isScalarType,
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
import { type } from 'os';

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
    const s = fieldToShape(
      {
        selections: info.fieldNodes.find((node) => node.name.value === info.fieldName)!.selectionSet
          ?.selections,
        graphql: info.parentType.getFields()[info.fieldName].type,
        edgeql: scope.__element__,
      },
      info,
    );

    return s;
  };

interface FieldDetails {
  selections: readonly SelectionNode[] | undefined;
  graphql: GraphQLOutputType;
  edgeql: SomeType;
}

const fieldToShape = (field: FieldDetails, graphqlInfo: GraphQLResolveInfo) => {
  if (!field.selections || field.edgeql.__kind__ !== TypeKind.object) return true;

  // Type may define fields to select
  let shape = {};
  const typeExtensions = getGraphqlTypeExtensions(field.graphql);
  if (typeExtensions.select && typeof typeExtensions.select === 'object')
    shape = merge(shape, typeExtensions.select);

  const graphqlFields = getGraphqlTypeFields(field.graphql);

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

          return merge(shape, {
            [childNode.name.value]: fieldToShape(
              {
                selections: childNode.selectionSet?.selections,
                graphql: childSchema.type,
                edgeql: childEqlType,
              },
              graphqlInfo,
            ),
          });
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
  const fieldGqlBase = getGraphqlBaseType(field.graphql);
  const fragmentGql = fragment.typeCondition
    ? graphqlInfo.schema.getType(fragment.typeCondition.name.value)
    : undefined;
  if (fragmentGql && !isOutputType(fragmentGql))
    throw new Error(`GQL type is not a GraphQLOutputType: ${fragmentGql.name}`);

  // Only type narrow when:
  const typeNarrowingRequired = !!(
    // Fragment type differs from field type
    (
      fragmentGql &&
      fragmentGql !== fieldGqlBase &&
      // Fragment is not a interface of the field type
      !(
        isInterfaceType(fragmentGql) &&
        'getInterfaces' in fieldGqlBase &&
        fieldGqlBase.getInterfaces().includes(fragmentGql)
      )
    )
  );

  if (!typeNarrowingRequired) {
    // Simple case - just merge the fragment shape as-is
    const fragmentShape = fieldToShape(
      {
        selections: fragment.selectionSet?.selections,
        graphql: field.graphql,
        edgeql: field.edgeql,
      },
      graphqlInfo,
    );

    return merge(shape, fragmentShape);
  }

  const fragmentEql: ObjectTypeExpression | undefined =
    fragmentGql.extensions.eqlType || e[fragmentGql.name];
  if (!fragmentEql)
    throw new Error(`No EQL type found for fragment with GraphQL type: ${fragmentGql.name}`);

  const fragmentShape = fieldToShape(
    {
      selections: fragment.selectionSet?.selections,
      graphql: fragmentGql,
      edgeql: fragmentEql.__element__,
    },
    graphqlInfo,
  );

  // Duplicate polymorphic (e.is()) fields are shadowed; place on base type if possible - https://github.com/edgedb/edgedb-js/issues/630
  const fieldEql: ObjectTypeExpression | undefined =
    fieldGqlBase.extensions.eqlType || e[fieldGqlBase.name];
  const fieldEqlFields = fieldEql ? Object.keys(fieldEql?.__element__.__pointers__) : [];

  return {
    ...shape,
    ...e.is(fragmentEql, fragmentShape),
    ..._.pick(fragmentShape, [
      'id' /* ignored by e.is() */,
      '__type__' /* errors if included by e.is() */,
      ...fieldEqlFields,
    ]),
  };
};

const getGraphqlBaseType = (
  type: GraphQLOutputType,
):
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLScalarType
  | GraphQLEnumType
  | GraphQLUnionType =>
  match(type)
    .with({ ofType: P.not(P.nullish) }, (type) => getGraphqlBaseType(type.ofType))
    .otherwise((type) => type);

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
