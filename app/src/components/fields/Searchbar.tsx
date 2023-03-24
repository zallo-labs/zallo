import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { toArray } from 'lib';
import React from 'react';
import { FC } from 'react';
import { View } from 'react-native';
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

      <View style={styles.trailingContainer}>
        {toArray(trailing ?? []).map((Trailing, i) => (
          <Trailing key={i} size={styles.trailingIcon.fontSize} color={styles.trailingIcon.color} />
        ))}
      </View>

      {trailing && (
        <Container style={styles.trailingContainer} separator={<Box mr={2} />}></Container>
      )}
    </Surface>
  );
};

const useStyles = makeStyles(({ colors, corner, fonts }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    minWidth: 360,
    maxWidth: 720,
    borderRadius: corner.full,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  leadingContainer: {
    paddingRight: 16,
  },
  leadingIcon: {
    fontSize: 24,
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
    flexDirection: 'row',
    gap: 16,
  },
  trailingIcon: {
    fontSize: 24,
    color: colors.onSurfaceVariant,
  },
}));
