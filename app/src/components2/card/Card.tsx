import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { ViewProps } from 'react-native';
import { Surface as Base, TouchableRipple } from 'react-native-paper';
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
import { makeStyles } from '@util/theme/makeStyles';

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
const StyledBase = styled(Base)<StyledProps>`
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

type BaseProps = ComponentPropsWithoutRef<typeof Base>;
type StyledBaseProps = BaseProps & StyledProps;
type TouchableRippleProps = ComponentPropsWithoutRef<typeof TouchableRipple>;

export type CardProps = Omit<StyledBaseProps, 'children' | 'theme'> &
  Pick<TouchableRippleProps, 'onPress' | 'onLongPress' | 'disabled'> & {
    children?: ReactNode;
  };

const borderRadius = 12;

export const Card = ({
  children,
  onPress,
  onLongPress,
  disabled,
  ...props
}: CardProps) => {
  const styles = useStyles(disabled);

  return (
    <TouchableRipple
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={styles.borderRadius}
    >
      <StyledBase
        p={3}
        {...props}
        style={[styles.borderRadius, styles.card, props.style]}
      >
        {children}
      </StyledBase>
    </TouchableRipple>
  );
};

const useStyles = makeStyles((_theme, disabled: boolean) => ({
  borderRadius: {
    borderRadius,
  },
  card: {
    ...(disabled && { opacity: 0.38 }),
  },
}));
