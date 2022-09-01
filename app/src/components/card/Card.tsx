import { Space } from '@theme/styledComponents';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { StyleProp, ViewProps, ViewStyle } from 'react-native';
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
import { makeStyles } from '~/util/theme/makeStyles';

export interface StyledProps
  extends ViewProps,
    BordersProps,
    FlexboxProps,
    LayoutProps,
    SpaceProps {
  children?: ReactNode;
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
    touchableStyle?: StyleProp<ViewStyle>;
    opaque?: boolean;
  };

export const CARD_BORDER_RADIUS = 12;

export const Card = ({
  children,
  onPress,
  onLongPress,
  disabled,
  touchableStyle,
  opaque,
  ...props
}: CardProps) => {
  const styles = useStyles(opaque || disabled);

  return (
    <StyledBase {...props} style={[styles.card, props.style]}>
      <TouchableRipple
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        style={[styles.touchable, touchableStyle]}
      >
        <>{children}</>
      </TouchableRipple>
    </StyledBase>
  );
};

const useStyles = makeStyles(({ space }, opaque: boolean) => ({
  card: {
    borderRadius: CARD_BORDER_RADIUS,
    // TouchableOpacity doesn't respect borderRadius, so hide the touchable ripple effect outside of the view;
    overflow: 'hidden',
    ...(opaque && { opacity: 0.38 }),
  },
  touchable: {
    flexGrow: 1,
    padding: space(3),
  },
}));
