import React, { ComponentProps } from 'react';
import { ViewProps } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
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

export interface InternalBoxProps
  extends ViewProps,
    BordersProps,
    ColorProps,
    FlexboxProps,
    LayoutProps,
    SpaceProps {
  children?: React.ReactNode;

  flexed?: boolean;
  center?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
}

const InternalBox = styled.View<InternalBoxProps>`
  ${flexbox};
  ${layout};
  ${borders};
  ${space};
  ${color};

  ${(props: InternalBoxProps) =>
    props.flexed &&
    `
    display: flex;
    flex: 1;
  `}

  ${(props: InternalBoxProps) =>
    props.center &&
    `
    justifyContent: center;
    alignItems: center;
  `}

  ${(props: InternalBoxProps) =>
    props.horizontal &&
    `
    display: flex;
    flexDirection: row;
  `}

  ${(props: InternalBoxProps) =>
    props.vertical &&
    `
    display: flex;
    flexDirection: column;
  `}
`;

export interface BoxProps extends InternalBoxProps {
  card?: boolean;
  cardProps?: ComponentProps<typeof Card>;
}

export const Box = ({ children, card, cardProps, ...props }: BoxProps) => {
  const { colors } = useTheme();

  return card ? (
    <Card {...cardProps}>
      <InternalBox mx={5} my={3} {...props}>
        {children}
      </InternalBox>
    </Card>
  ) : (
    <InternalBox backgroundColor={colors.background} {...props}>
      {children}
    </InternalBox>
  );
};
