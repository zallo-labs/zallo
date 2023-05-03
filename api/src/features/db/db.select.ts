import { SelectModifiers, objectTypeToSelectShape } from '@db/edgeql-js/select';
import {
  FieldNode,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLResolveInfo,
  InlineFragmentNode,
  Kind,
  SelectionSetNode,
  isInterfaceType,
  isObjectType,
} from 'graphql';
import { P, match } from 'ts-pattern';
import { $scopify, ObjectTypeExpression, ObjectTypeSet } from '@db/edgeql-js/typesystem';
import merge from 'ts-deepmerge';
import e from '@db/edgeql-js';
import { $linkPropify } from '@db/edgeql-js/syntax';
import { Cardinality } from 'edgedb/dist/reflection';

export type Shape<T extends ObjectTypeSet> = objectTypeToSelectShape<T['__element__']> &
  SelectModifiers<T['__element__']>;

export const getSelect =
  (info: GraphQLResolveInfo) =>
  <Expr extends ObjectTypeExpression>(
    scope: $scopify<Expr['__element__']> &
      $linkPropify<{
        [k in keyof Expr]: k extends '__cardinality__' ? Cardinality.One : Expr[k];
      }>,
  ) => {
    return fieldToShape(
      info.fieldNodes.find((node) => node.name.value === info.fieldName)!.selectionSet,
      info.parentType.getFields()[info.fieldName],
      info,
    );
  };

const fieldToShape = (
  // node: FieldNode | InlineFragmentNode,
  selectionSet: SelectionSetNode | undefined,
  fieldSchema: GraphQLField<unknown, unknown>,
  info: GraphQLResolveInfo,
): any => {
  if (!selectionSet) return true;

  const schemaType = getObjType(fieldSchema.type);
  if (!schemaType) throw new Error(`Schema type not found for field: ${fieldSchema.name}`);

  return selectionSet.selections.reduce(
    (acc, node) =>
      match(node)
        .with({ kind: Kind.FIELD }, (childNode) => {
          const childSchema = schemaType.getFields()[childNode.name.value];

          const { select } = childSchema.extensions;
          if (select && typeof select === 'object') return merge(acc, select);

          return {
            ...acc,
            [childNode.name.value]: fieldToShape(childNode.selectionSet, childSchema, info),
          };
        })
        .with({ kind: Kind.FRAGMENT_SPREAD }, (fragmentNode) => {
          const fragment = info.fragments[fragmentNode.name.value];
          // TODO: handle type restriction

          return merge(acc, fieldToShape(fragment.selectionSet, fieldSchema, info));
        })
        .with({ kind: Kind.INLINE_FRAGMENT }, (fragment) => {
          // TODO: handle type restriction

          return merge(acc, fieldToShape(fragment.selectionSet, fieldSchema, info));
        })
        .exhaustive(),
    {},
  );
};

const getObjType = (type: GraphQLOutputType): GraphQLObjectType | GraphQLInterfaceType | null =>
  match(type)
    .when(isObjectType, (type) => type)
    .when(isInterfaceType, (type) => type)
    .with({ ofType: P.not(P.nullish) }, (type) => getObjType(type.ofType))
    .otherwise(() => null);
