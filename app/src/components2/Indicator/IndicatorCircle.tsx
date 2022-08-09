import { makeStyles } from '@util/theme/makeStyles';
import { memo } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface IndicatorCircleProps {
  selected: boolean;
}

export const IndicatorCircle = memo(({ selected }: IndicatorCircleProps) => {
  const styles = useStyles();

  return (
    <Animated.View
      style={selected ? styles.selected : styles.notSelected}
      entering={FadeIn}
      exiting={FadeOut}
    />
  );
});

const useStyles = makeStyles(({ colors }) => ({
  selected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.onBackground,
  },
  notSelected: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceDisabled,
  },
}));
