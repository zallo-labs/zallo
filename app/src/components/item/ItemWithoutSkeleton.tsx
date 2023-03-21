import { FC, ReactNode } from 'react';
import { Box } from '~/components/layout/Box';
import { isFunctionalComponent } from '~/util/typing';
import { withKeys } from '~/util/children';
import { TouchableRipple, TouchableRippleProps } from 'react-native-paper';
import { StyleProp, ViewStyle } from 'react-native';
import { makeStyles } from '@theme/makeStyles';

type TouchableProps = Pick<TouchableRippleProps, 'onLongPress'>;

export interface ItemWithoutSkeletonProps extends TouchableProps, Style {
  Left?: ReactNode | FC;
  Main?: ReactNode | FC;
  Right?: ReactNode | FC;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ItemWithoutSkeleton = ({
  Left,
  Main,
  Right,
  selected,
  disabled,
  padding,
  style,
  ...touchableProps
}: ItemWithoutSkeletonProps) => {
  const styles = useStyles({ selected, disabled, padding });

  return (
    <TouchableRipple {...touchableProps} disabled={disabled} style={[styles.container, style]}>
      <>
        {Left &&
          (isFunctionalComponent(Left) ? (
            <Left />
          ) : (
            <Box justifyContent="center" mr={2}>
              {withKeys(Left)}
            </Box>
          ))}

        {Main &&
          (isFunctionalComponent(Main) ? (
            <Main />
          ) : (
            <Box flex={1} vertical justifyContent="center">
              {withKeys(Main)}
            </Box>
          ))}

        {Right &&
          (isFunctionalComponent(Right) ? (
            <Right />
          ) : (
            <Box vertical justifyContent="space-around" alignItems="flex-end">
              {withKeys(Right)}
            </Box>
          ))}
      </>
    </TouchableRipple>
  );
};

interface Style {
  selected?: boolean;
  disabled?: boolean;
  padding?: true | 'vertical' | 'horizontal';
}

const useStyles = makeStyles(({ colors, space }, { selected, disabled, padding }: Style) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...(selected && { backgroundColor: colors.surfaceVariant }),
    ...(disabled && { opacity: 0.6 }),
    ...(padding === true && { padding: space(2) }),
    ...(padding === 'vertical' && { paddingVertical: space(2) }),
    ...(padding === 'horizontal' && { paddingHorizontal: space(2) }),
  },
}));
