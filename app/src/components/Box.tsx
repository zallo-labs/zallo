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

type SurfaceProps = ComponentPropsWithoutRef<typeof Surface>;

export interface InternalProps
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

const Internal = styled(Surface)<InternalProps & SurfaceProps>`
  ${flexbox};
  ${layout};
  ${borders};
  ${space};
  ${color};

  ${(props: InternalProps) =>
    props.flexed &&
    `
    flex: 1;
  `}

  ${(props: InternalProps) =>
    props.center &&
    `
    justifyContent: center;
    alignItems: center;
  `}

  ${(props: InternalProps) =>
    props.horizontal &&
    `
    display: flex;
    flexDirection: row;
  `}

  ${(props: InternalProps) =>
    props.vertical &&
    `
    display: flex;
    flexDirection: column;
  `}
`;

export type BoxProps = Omit<SurfaceProps, 'children'> &
  InternalProps & {
    children?: ReactNode;
    surface?: boolean;
    rounded?: number | boolean;
  };

export const Box = ({
  children,
  surface,
  style,
  // accessibilityRole: _,
  ...props
}: BoxProps) => {
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
