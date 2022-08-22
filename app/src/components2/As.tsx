import { ComponentPropsWithoutRef, FC } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

type TextVariant = ComponentPropsWithoutRef<typeof Text>['variant'];

export interface AsTypeProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

export type AsType = NonNullable<FC<AsTypeProps> | TextVariant>;

export interface AsProps extends AsTypeProps {
  as: AsType;
  style?: StyleProp<TextStyle>;
}

export const As = ({ children, as: A, style }: AsProps) =>
  typeof A === 'string' ? (
    <Text variant={A} style={style}>
      {children}
    </Text>
  ) : (
    <A style={style}>{children}</A>
  );
