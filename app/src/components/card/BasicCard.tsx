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
type StyledBaseProps = Omit<BaseProps & StyledProps, 'children' | 'theme' | 'padding'>;

export type CardProps = StyledBaseProps &
  Style & {
    children?: ReactNode;
    padding?: StyledProps['padding'] | true;
  };

export const CARD_BORDER_RADIUS = 12;

export const BasicCard = ({ children, padding, selected, selectedColor, ...props }: CardProps) => {
  const styles = useStyles({
    selected,
    selectedColor,
    padding: padding === true,
  });

  return (
    <StyledBase
      {...props}
      style={[styles.card, props.style]}
      padding={padding !== true ? padding : undefined}
    >
      {children}
    </StyledBase>
  );
};

interface Style {
  selected?: boolean;
  selectedColor?: string;
  padding?: boolean;
}

const useStyles = makeStyles(({ colors }, { selected, selectedColor, padding }: Style) => ({
  card: {
    borderRadius: CARD_BORDER_RADIUS,
    // TouchableOpacity doesn't respect borderRadius, so hide the touchable ripple effect outside of the view;
    overflow: 'hidden',
    ...(selected && {
      backgroundColor: selectedColor ?? colors.surfaceVariant,
    }),
    ...(padding && { padding: 16 }),
  },
}));
