import {
  FieldNode,
  FragmentDefinitionNode,
  GraphQLEnumType,
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
  isInterfaceType,
  isObjectType,
  isOutputType,
  isUnionType,
} from 'graphql';
import { P, match } from 'ts-pattern';
import { SelectModifiers, objectTypeToSelectShape } from '~/edgeql-js/select';
import { $scopify, ObjectTypeExpression, ObjectTypeSet, SomeType } from '~/edgeql-js/typesystem';
import { $linkPropify } from '~/edgeql-js/syntax';
import { Cardinality, TypeKind } from 'edgedb/dist/reflection';
import { deepmergeCustom } from 'deepmerge-ts';
import assert from 'assert';
import e from '~/edgeql-js';
import _ from 'lodash';
import typesUtil from 'node:util/types';
import { CONFIG } from '~/config';

// Avoid deep merging edgedb type reflection metadata (from e.is) as they can be very deep!
const merge = deepmergeCustom({
  mergeRecords: (values, utils, meta) => {
    // Don't merge proxy objects
    if (meta?.key === '__polyType__') return values[0];
    if (CONFIG.env === 'development' && typesUtil.isProxy(values[0]))
      throw new Error('Unexpected proxy found when merging select shapes');

    return utils.defaultMergeFunctions.mergeRecords(values, utils, meta);
  },
});

export type Scope<Expr extends ObjectTypeExpression> = $scopify<Expr['__element__']> &
  $linkPropify<{
    [k in keyof Expr]: k extends '__cardinality__' ? Cardinality.One : Expr[k];
  }>;

export type Shape<T extends ObjectTypeSet> = objectTypeToSelectShape<T['__element__']> &
  SelectModifiers<T['__element__']>;

export type ShapeFunc<Expr extends ObjectTypeExpression = ObjectTypeExpression> = ((
  scope: Scope<Expr>,
  field?: string,
) => Shape<Expr>) & { includes?: (field: string) => boolean };

export const getShape = <Expr extends ObjectTypeExpression>(info: GraphQLResolveInfo) => {
  const rootSelections = info.fieldNodes.find((node) => node.name.value === info.fieldName)!
    .selectionSet?.selections;
  const rootType = info.parentType.getFields()[info.fieldName].type;

  const f: ShapeFunc<Expr> = function resolveShape(
    scope: Scope<Expr>,
    field?: string,
  ): Shape<Expr> {
    const edgeql = scope.__element__;

    return field
      ? (() => {
          const fieldNode = rootSelections?.find(
            (n) => n.kind === Kind.FIELD && n.name.value === field,
          ) as FieldNode | undefined;
          if (!fieldNode) return {};

          const fieldSelections = fieldNode.selectionSet?.selections;
          const rootFieldTypes = getGraphqlTypeFields(rootType);
          const fieldType = rootFieldTypes[field].type;

          return fieldToShape({ selections: fieldSelections, graphql: fieldType, edgeql }, info);
        })()
      : fieldToShape({ selections: rootSelections, graphql: rootType, edgeql }, info);
  };

  f.includes = (field: string) =>
    !!rootSelections?.find((n) => n.kind === Kind.FIELD && n.name.value === field);

  return f;
};

interface FieldDetails {
  selections: readonly SelectionNode[] | undefined;
  graphql: GraphQLOutputType;
  edgeql: SomeType;
}

function fieldToShape(field: FieldDetails, graphqlInfo: GraphQLResolveInfo) {
  if (!field.selections || field.edgeql.__kind__ !== TypeKind.object) return true;

  // Type may define fields to select
  let shape: object = {};
  const typeExtensions = getGraphqlTypeExtensions(field.graphql);
  if (typeExtensions.select && typeof typeExtensions.select === 'object')
    shape = merge(shape, typeExtensions.select);

  // Include EQL type name for union types
  const baseGqlType = getGraphqlBaseType(field.graphql);
  if (isUnionType(baseGqlType) || isInterfaceType(baseGqlType))
    shape = merge(shape, { __type__: { name: true } });

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
}

function getFragmentShape(
  field: FieldDetails,
  graphqlInfo: GraphQLResolveInfo,
  fragment: FragmentDefinitionNode | InlineFragmentNode,
  shape: object,
) {
  const simpleGqlTypes = getGraphqlSimpleTypes(getGraphqlBaseType(field.graphql));

  return simpleGqlTypes.reduce((shape, fieldBaseGqlType) => {
    const fragmentShape = getBaseTypeFragmentShape(
      field,
      graphqlInfo,
      fragment,
      shape,
      fieldBaseGqlType,
    );

    return merge(shape, fragmentShape);
  }, shape);
}

function getBaseTypeFragmentShape(
  field: FieldDetails,
  graphqlInfo: GraphQLResolveInfo,
  fragment: FragmentDefinitionNode | InlineFragmentNode,
  shape: object,
  fieldGql: GqlBaseType,
) {
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
      fragmentGql !== fieldGql &&
      // Fragment is not a interface of the field type
      !(
        isInterfaceType(fragmentGql) &&
        'getInterfaces' in fieldGql &&
        fieldGql.getInterfaces().includes(fragmentGql)
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

  // Type narrowing is only valid when the fragment extends the field; other cases may never occur
  const fragmentExtendsField =
    isInterfaceType(fieldGql) &&
    'getInterfaces' in fragmentGql &&
    fragmentGql.getInterfaces().includes(fieldGql);
  if (!fragmentExtendsField) return shape;

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

  // Duplicate polymorphic (e.is()) fields are shadowed (resulting in "PolyShape" error); place on base type or rename to be unique - https://github.com/edgedb/edgedb-js/issues/630
  const fieldEql: ObjectTypeExpression | undefined =
    fieldGql.extensions.eqlType || e[fieldGql.name];
  const fieldEqlFields = fieldEql ? Object.keys(fieldEql?.__element__.__pointers__) : [];

  return merge(shape, {
    ...e.is(fragmentEql, fragmentShape),
    ..._.pick(fragmentShape, [
      'id' /* ignored by e.is() */,
      '__type__' /* errors if included by e.is() */,
      ...fieldEqlFields,
    ]),
  });
}

type GqlBaseType = GqlSimpleType | GraphQLUnionType;

const getGraphqlBaseType = (type: GraphQLOutputType): GqlBaseType =>
  match(type)
    .with({ ofType: P.not(P.nullish) }, (type) => getGraphqlBaseType(type.ofType))
    .otherwise((type) => type);

type GqlSimpleType = GraphQLObjectType | GraphQLInterfaceType | GraphQLScalarType | GraphQLEnumType;

const getGraphqlSimpleTypes = (type: GraphQLOutputType): GqlSimpleType[] =>
  match(type)
    .when(isUnionType, (type) => type.getTypes().flatMap(getGraphqlSimpleTypes))
    .with({ ofType: P.not(P.nullish) }, (type) => getGraphqlSimpleTypes(type.ofType))
    .otherwise((type) => [type]);

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
