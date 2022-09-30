import { FC, ReactNode } from 'react';
import { Box } from '~/components/layout/Box';
import { isFunctionalComponent } from '~/util/typing';
import { withKeys } from '~/util/children';
import { TouchableRipple, TouchableRippleProps } from 'react-native-paper';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { makeStyles } from '@theme/makeStyles';

type TouchableProps = Pick<TouchableRippleProps, 'onPress' | 'onLongPress'>;

export interface ItemWithoutSkeletonProps extends TouchableProps {
  Left?: ReactNode | FC;
  Main?: ReactNode | FC;
  Right?: ReactNode | FC;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ItemWithoutSkeleton = ({
  Left,
  Main,
  Right,
  disabled,
  style,
  ...touchableProps
}: ItemWithoutSkeletonProps) => {
  const styles = useStyles(disabled);

  return (
    <TouchableRipple
      {...touchableProps}
      disabled={disabled}
      style={[styles.container, style]}
    >
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
            <Box flex={1} vertical justifyContent="space-around">
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

const useStyles = makeStyles(({ opacity }, disabled?: boolean) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...(disabled && { opacity: opacity.disabled }),
  },
}));
