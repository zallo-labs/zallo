import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { ViewProps } from 'react-native';
import { Surface, TouchableRipple } from 'react-native-paper';
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
const Internal = styled(Surface)<StyledProps>`
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

type SurfaceProps = ComponentPropsWithoutRef<typeof Surface>;
type InternalProps = SurfaceProps & StyledProps;
type TouchableRippleProps = ComponentPropsWithoutRef<typeof TouchableRipple>;

export type CardOldProps = Omit<InternalProps, 'children'> &
  Pick<TouchableRippleProps, 'onPress' | 'onLongPress'> & {
    children?: ReactNode;
  };

export const CardOld = ({
  children,
  onPress,
  onLongPress,
  ...props
}: CardOldProps) => {
  const { roundness } = useTheme();

  return (
    <TouchableRipple
      onPress={onPress}
      onLongPress={onLongPress}
      borderless
      style={{ borderRadius: roundness }}
    >
      <Internal
        {...(props as any)}
        elevation={2}
        style={[{ borderRadius: roundness }, props.style]}
      >
        {children}
      </Internal>
    </TouchableRipple>
  );
};
