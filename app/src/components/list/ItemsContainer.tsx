import React, { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { ChildrenProps } from '@util/children';
import { Box } from '@components/Box';
import { Divider } from '@components/Divider';

const space = 3;

export const ItemsContainer = ({ children }: ChildrenProps) => {
  const { radius } = useTheme();

  const surface = useMemo(
    () => ({
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
    }),
    [radius],
  );

  const count = React.Children.count(children);

  return (
    <Box surface={surface}>
      {React.Children.map(children, (child, i) => (
        <Box mt={i > 0 ? space : 0}>
          {child}

          {i < count - 1 && (
            <Box mt={space}>
              <Divider />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};
