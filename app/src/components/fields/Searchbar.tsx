import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { toArray } from 'lib';
import React from 'react';
import { FC } from 'react';
import { Surface } from 'react-native-paper';
import { Box } from '../layout/Box';
import { Container } from '../layout/Container';
import { BasicTextField, BasicTextFieldProps } from './BasicTextField';

export interface SearchbarProps extends BasicTextFieldProps {
  leading?: FC<IconProps>;
  trailing?: FC<IconProps> | FC<IconProps>[];
  placeholder: string;
}

export const Searchbar = ({ leading: Leading, trailing, ...inputProps }: SearchbarProps) => {
  const styles = useStyles();

  return (
    <Surface elevation={3} style={styles.container}>
      {Leading && (
        <Box style={styles.leadingContainer}>
          {<Leading size={styles.leadingIcon.fontSize} color={styles.leadingIcon.color} />}
        </Box>
      )}

      <BasicTextField {...inputProps} style={[styles.input, inputProps.style]} />

      {trailing && (
        <Container style={styles.trailingContainer} separator={<Box mr={2} />}>
          {toArray(trailing).map((Trailing, i) => (
            <Trailing
              key={i}
              size={styles.trailingIcon.fontSize}
              color={styles.trailingIcon.color}
            />
          ))}
        </Container>
      )}
    </Surface>
  );
};

const useStyles = makeStyles(({ colors, s, corner, fonts }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: s(56),
    minWidth: s(360),
    maxWidth: s(720),
    borderRadius: corner.full,
    marginHorizontal: s(16),
    paddingHorizontal: s(16),
  },
  leadingContainer: {
    paddingRight: s(16),
  },
  leadingIcon: {
    fontSize: s(24),
    color: colors.onSurface,
  },
  input: {
    flex: 1,
    ...fonts.bodyLarge,
  },
  inputPlaceholder: {
    color: colors.onSurfaceVariant,
  },
  trailingContainer: {
    marginLeft: s(16),
  },
  trailingIcon: {
    fontSize: s(24),
    color: colors.onSurfaceVariant,
  },
}));
