import React, { Fragment, ReactNode, useMemo } from 'react';
import { BoxProps, Box } from '~/components/layout/Box';
import { getNodeKey } from '~/util/children';

export interface ContainerProps extends BoxProps {
  children?: ReactNode;
  separator?: ReactNode;
}

export const Container = ({
  children: childrenNode,
  separator,
  ...boxProps
}: ContainerProps) => {
  const children = useMemo(
    () => React.Children.toArray(childrenNode).filter(Boolean),
    [childrenNode],
  );

  return (
    <Box {...boxProps}>
      {children.map((child, i) => (
        <Fragment key={getNodeKey(child, i)}>
          {child}

          {separator && i < children.length - 1 ? separator : null}
        </Fragment>
      ))}
    </Box>
  );
};
