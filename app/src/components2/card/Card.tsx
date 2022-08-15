import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { ViewProps } from 'react-native';
import { Card as BaseCard, TouchableRipple } from 'react-native-paper';
import styled from 'styled-components/native';
import {
  borders,
  BordersProps,
  color,
  flexbox,
  FlexboxProps,
  layout,
  LayoutProps,
  space,
  SpaceProps,
} from 'styled-system';

import { ChildrenProps } from '@util/children';
import { useTheme } from '@util/theme/paper';
import { Box } from '@components/Box';

export interface StyledProps
  extends ChildrenProps,
    ViewProps,
    BordersProps,
    FlexboxProps,
    LayoutProps,
    SpaceProps {
  flexed?: boolean;
  center?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
  backgroundColor?: string;
}

// TODO: move to Animated.View once this issue is resolved: https://github.com/software-mansion/react-native-reanimated/issues/3209
const Internal = styled(BaseCard)<StyledProps>`
  ${flexbox};
  ${layout};
  ${borders};
  ${space};
  ${color};

  ${(props: StyledProps) =>
    props.flexed &&
    `
    flex: 1;
  `}

  ${(props: StyledProps) =>
    props.center &&
    `
    justifyContent: center;
    alignItems: center;
  `}

  ${(props: StyledProps) =>
    props.horizontal &&
    `
    display: flex;
    flexDirection: row;
  `}

  ${(props: StyledProps) =>
    props.vertical &&
    `
    display: flex;
    flexDirection: column;
  `}
`;

type BaseCardProps = ComponentPropsWithoutRef<typeof BaseCard>;
type InternalProps = BaseCardProps & StyledProps;
type TouchableRippleProps = ComponentPropsWithoutRef<typeof TouchableRipple>;

export type CardProps = Omit<InternalProps, 'children'> &
  Pick<TouchableRippleProps, 'onPress' | 'onLongPress' | 'disabled'> & {
    children?: ReactNode;
  };

const borderRadius = 12;

export const Card = ({
  children,
  onPress,
  onLongPress,
  disabled,
  elevation = 2,
  ...props
}: CardProps) => {
  const { colors } = useTheme();

  return (
    <TouchableRipple
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      borderless
      style={{ borderRadius }}
    >
      <Internal
        backgroundColor={
          colors.elevation[`level${elevation?.toString()}` as any] ||
          colors.elevation.level1
        }
        p={3}
        {...(props as any)}
        style={[
          { borderRadius, ...(disabled && { opacity: 0.38 }) },
          props.style,
        ]}
      >
        {children}
      </Internal>
    </TouchableRipple>
  );
};
