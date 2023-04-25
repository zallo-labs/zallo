import { Hex, isAddress, isHex } from 'lib';
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { Text } from 'react-native-paper';
import { tryDecodeHexString } from '~/util/decodeHex';
import {
  Eip712DataNode,
  Eip712TypedDomainData,
  asTypedDataNode,
  isTypedData,
  isTypedDataNode,
} from '~/util/walletconnect/methods';
import { AddressLabel } from '../address/AddressLabel';
import { match } from 'ts-pattern';
import { makeStyles } from '@theme/makeStyles';

export type NodeValue = string | Hex | Eip712DataNode | Eip712TypedDomainData;

export interface NodeProps {
  children: NodeValue;
  style?: StyleProp<TextStyle>;
}

export const Node = ({ children: value, style }: NodeProps) => {
  const styles = useStyles();
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

const useStyles = makeStyles(({ colors }) => ({
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
