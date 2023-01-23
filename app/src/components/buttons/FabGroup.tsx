import { makeStyles } from '@theme/makeStyles';
import React, { FC } from 'react';
import { Box } from '../layout/Box';
import { Container } from '../layout/Container';
import { FabProps } from './Fab';

export interface FabGroupProps {
  children: FC<Partial<FabProps>>[];
}

export const FabGroup = ({ children }: FabGroupProps) => {
  const styles = useStyles();

  return (
    <Container
      style={{ position: 'absolute', left: 0, bottom: 0 }}
      separator={<Box style={styles.separator} />}
    >
      {React.Children.map(children, (Child) => (
        <Child style={styles.fab} />
      ))}
    </Container>
  );
};

const useStyles = makeStyles(({ s }) => ({
  separator: {
    marginVertical: s(64),
  },
  fab: {
    position: undefined,
    left: undefined,
    right: undefined,
    bottom: undefined,
  },
}));
