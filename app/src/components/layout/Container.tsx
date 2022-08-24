import React, { ReactNode, useMemo } from 'react';
import { getNodeKey } from '~/util/children';
import { BoxProps, Box } from '~/components/layout/Box';

export interface ContainerProps extends BoxProps {
  children?: ReactNode;
  separator?: ReactNode | BoxProps;
  horizontal?: boolean;
}

export const Container = ({
  children: childrenNode,
  separator,
  horizontal,
  ...boxProps
}: ContainerProps) => {
  const children = useMemo(
    () => React.Children.toArray(childrenNode).filter(Boolean),
    [childrenNode],
  );

  return (
    <Box horizontal={horizontal} {...boxProps}>
      {children.map((child, i) => (
        <Box key={getNodeKey(child, i)} horizontal={horizontal}>
          {child}

          {separator && i < children.length - 1 ? separator : null}
        </Box>
      ))}
    </Box>
  );
};
