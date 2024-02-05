import { Hex, asUAddress, isAddress, isHex, type Address } from 'lib';
import { StyleProp, TextStyle, View, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { tryDecodeHexString } from '~/util/decodeHex';
import { AddressLabel } from '../address/AddressLabel';
import { P, match } from 'ts-pattern';
import { TypedDataDefinition } from 'viem';
import { createStyles, useStyles } from '@theme/styles';
import { Chain } from 'chains';

export type NodeValue = Address | Hex | string | TypedDataDefinition | TypedDataNode;

export interface TypedDataNode {
  type?: string;
  name?: string;
  children: TypedDataNode[] | string;
}

export interface NodeProps {
  children: NodeValue;
  chain: Chain;
  root?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Node({ children: value, chain, root, containerStyle }: NodeProps) {
  const { styles } = useStyles(stylesheet);

  return match(value)
    .when(isAddress, (v) => (
      <Text style={containerStyle}>
        <AddressLabel address={asUAddress(v, chain)} />
      </Text>
    ))
    .when(isHex, (v) => (
      <Text style={[containerStyle, styles.value]}>{tryDecodeHexString(v) ?? v}</Text>
    ))
    .with(P.string, (v) => <Text style={[containerStyle, styles.value]}>{v}</Text>)
    .when(isTypedData, (data) => (
      <Node root chain={chain} containerStyle={containerStyle}>
        {asTypedDataNode(data)}
      </Node>
    ))
    .with(
      P.intersection(P.when(isTypedDataNode), { children: P.string }),
      ({ name, type: _, children }) => (
        <View style={[containerStyle, styles.valueContainer]}>
          <Text variant="labelLarge" style={styles.name}>
            {name}
          </Text>
          {/* Omit type */}

          <Node chain={chain} textStyle={styles.value}>
            {children}
          </Node>
        </View>
      ),
    )
    .with(
      P.intersection(P.when(isTypedDataNode), { children: P.array(P.when(isTypedDataNode)) }),
      ({ name, type, children }) => (
        <View style={containerStyle}>
          <Text>
            <Text variant="labelLarge" style={styles.name}>
              {name}
            </Text>
            {name && type && ' '}
            <Text variant="labelLarge" style={styles.type}>
              {type}
            </Text>
            <Text variant="labelLarge" style={styles.nodeInfoSeparator}>
              :
            </Text>
          </Text>

          <View style={styles.nodeChildren(root)}>
            {children.map((child, i) => (
              <Node key={i} chain={chain} containerStyle={containerStyle}>
                {child}
              </Node>
            ))}
          </View>
        </View>
      ),
    )
    .exhaustive();
}

const stylesheet = createStyles(({ colors }) => ({
  name: {
    color: colors.tertiary,
  },
  type: {
    color: colors.primary,
  },
  nodeInfoSeparator: {
    color: colors.onSurfaceVariant,
  },
  nodeChildren: (root?: boolean) => ({
    marginLeft: 8,
    marginBottom: root ? 0 : 8,
  }),
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32,
  },
  value: {
    color: colors.onSurface,
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
