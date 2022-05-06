import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { ChildrenProps } from '@util/children';
import { Box } from './Box';

export const ItemsContainer = (props: ChildrenProps) => {
  const { radius } = useTheme();

  const surface = useMemo(
    () => ({
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
    }),
    [radius],
  );

  return <Box surface={surface}>{props.children}</Box>;
};
