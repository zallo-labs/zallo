import { ComponentPropsWithoutRef, FC } from 'react';
import { Text } from 'react-native-paper';

type TextVariant = ComponentPropsWithoutRef<typeof Text>['variant'];

export interface AsTypeProps {
  children: string;
}

export type AsType = NonNullable<FC<AsTypeProps> | TextVariant>;

export interface AsProps extends AsTypeProps {
  as: AsType;
}

export const As = ({ children, as: A }: AsProps) =>
  typeof A === 'string' ? (
    <Text variant={A}>{children}</Text>
  ) : (
    <A>{children}</A>
  );
