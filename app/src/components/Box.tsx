import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { ViewProps } from 'react-native';
import { Surface } from 'react-native-paper';
import styled from 'styled-components/native';
import {
  borders,
  BordersProps,
  color,
  ColorProps,
  flexbox,
  FlexboxProps,
  layout,
  LayoutProps,
  space,
  SpaceProps,
} from 'styled-system';

import { ChildrenProps } from '@util/children';

export interface StyledProps
  extends ChildrenProps,
    ViewProps,
    BordersProps,
    ColorProps,
    FlexboxProps,
    LayoutProps,
    SpaceProps {
  flexed?: boolean;
  center?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
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
// type InternalProps = ComponentPropsWithoutRef<typeof Internal>;

export type BoxProps = Omit<InternalProps, 'children'> & {
  children?: ReactNode;
  surface?: boolean;
  rounded?: number | boolean;
};

export const Box = ({ children, surface, style, ...props }: BoxProps) => {
  if (props.rounded)
    props.borderRadius = props.rounded === true ? 2 : props.rounded;

  return (
    <Internal
      {...(props as any)}
      style={[
        {
          ...(!surface &&
            !props.backgroundColor && { backgroundColor: undefined }),
        },
        style,
      ]}
    >
      {children}
    </Internal>
  );
};
