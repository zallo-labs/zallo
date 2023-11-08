import { Hex, isAddress, isHex } from 'lib';
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { Text } from 'react-native-paper';
import { tryDecodeHexString } from '~/util/decodeHex';
import { AddressLabel } from '../address/AddressLabel';
import { match } from 'ts-pattern';
import { TypedDataDefinition } from 'viem';
import { createStyles, useStyles } from '@theme/styles';

export type NodeValue = string | Hex | TypedDataNode | TypedDataDefinition;

export interface TypedDataNode {
  type?: string;
  name?: string;
  children: TypedDataNode[] | string;
}

export interface NodeProps {
  children: NodeValue;
  style?: StyleProp<TextStyle>;
}

export const Node = ({ children: value, style }: NodeProps) => {
  const { styles } = useStyles(stylesheet);
  const marginLeft = (StyleSheet.flatten(style)?.marginLeft as number) ?? 0;

  return match(value)
    .when(isAddress, (v) => (
      <Text style={style}>
        <AddressLabel address={v} />
      </Text>
    ))
    .when(isHex, (v) => <Text style={style}>{tryDecodeHexString(v) ?? v}</Text>)
    .when(isTypedData, (data) => <Node style={style}>{asTypedDataNode(data)}</Node>)
    .when(isTypedDataNode, ({ name, type, children }) =>
      children instanceof Array ? (
        <View>
          <Text style={style}>
            <Text style={[style, styles.name]}>{name}</Text>
            {name && type && ' '}
            <Text style={[style, styles.type]}>{type}</Text>
            {' {'}
          </Text>

          {children.map((child, i) => (
            <Node key={i} style={[style, { marginLeft: marginLeft + 8 }]}>
              {child}
            </Node>
          ))}

          <Text style={style}>{'}'}</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
          <Text style={[style, styles.name]}>{name}</Text>
          {/* Omit type */}

          <Node style={[style, styles.value]}>{children}</Node>
        </View>
      ),
    )
    .otherwise((v) => <Text style={style}>{v}</Text>);
};

const stylesheet = createStyles(({ colors }) => ({
  name: {
    // color: colors.onSurface,
    // color: colors.tertiary,
  },
  type: {
    color: colors.onSurface,
  },
  value: {
    color: colors.secondary,
  },
}));

function isTypedDataNode(v: NodeValue): v is TypedDataNode {
  return v !== null && typeof v === 'object' && 'children' in v;
}

function isTypedData(v: NodeValue): v is TypedDataDefinition {
  return (
    v !== null &&
    typeof v === 'object' &&
    'domain' in v &&
    'types' in v &&
    'primaryType' in v &&
    'message' in v
  );
}

function asTypedDataNode(d: TypedDataDefinition): TypedDataNode {
  const getNode = (
    v: Record<string, unknown> | unknown,
    name: string | undefined,
    type: string,
  ): TypedDataNode => {
    if (typeof v !== 'object' || v === null)
      return {
        name,
        type,
        children: typeof v === 'string' ? v : JSON.stringify(v),
      };

    const childrenTypes = d.types[type];

    return {
      name,
      type,
      children: Object.entries(v).map(([key, value]) =>
        getNode(value, key, childrenTypes.find((t) => t.name === key)!.type),
      ),
    };
  };

  return getNode(d.message, undefined, d.primaryType);
}
